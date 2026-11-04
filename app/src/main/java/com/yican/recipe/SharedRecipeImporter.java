package com.yican.recipe;

import android.content.ClipData;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.util.Base64;

import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class SharedRecipeImporter {
    interface Callback {
        void onResult(JSONObject result);
    }

    private static final int MAX_IMAGES = 6;
    private static final int MAX_IMAGE_EDGE = 1800;
    private static final long PREVIEW_TTL_MS = 7L * 24L * 60L * 60L * 1000L;
    private static final Pattern URL_PATTERN = Pattern.compile("https?://[^\\s<>\"']+", Pattern.CASE_INSENSITIVE);
    private static final Pattern SAFE_TOKEN = Pattern.compile("[a-f0-9-]{36}-\\d+\\.jpg");

    private final MainActivity activity;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final File previewDirectory;

    SharedRecipeImporter(MainActivity activity) {
        this.activity = activity;
        this.previewDirectory = new File(activity.getFilesDir(), "shared_recipe_images");
        if (!previewDirectory.exists()) previewDirectory.mkdirs();
    }

    boolean accepts(Intent intent) {
        if (intent == null) return false;
        String action = intent.getAction();
        return Intent.ACTION_SEND.equals(action) || Intent.ACTION_SEND_MULTIPLE.equals(action);
    }

    void process(Intent intent, Callback callback) {
        if (!accepts(intent)) return;
        final String subject = clean(intent.getStringExtra(Intent.EXTRA_SUBJECT));
        CharSequence extraText = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
        final String sharedText = clean(extraText == null ? "" : extraText.toString());
        final List<Uri> images = collectImageUris(intent);
        executor.execute(() -> callback.onResult(processOnWorker(subject, sharedText, images)));
    }

    private JSONObject processOnWorker(String subject, String sharedText, List<Uri> imageUris) {
        cleanupOldPreviews();
        JSONObject payload = new JSONObject();
        JSONArray images = new JSONArray();
        JSONArray errors = new JSONArray();
        StringBuilder ocrText = new StringBuilder();
        String batchId = UUID.randomUUID().toString();
        TextRecognizer recognizer = null;
        try {
            payload.put("status", "processing");
            payload.put("batchId", batchId);
            payload.put("subject", subject);
            payload.put("sharedText", sharedText);
            payload.put("sourceUrl", firstUrl(subject + "\n" + sharedText));
            if (!imageUris.isEmpty()) {
                recognizer = TextRecognition.getClient(new ChineseTextRecognizerOptions.Builder().build());
                for (int index = 0; index < imageUris.size(); index++) {
                    Uri uri = imageUris.get(index);
                    Bitmap bitmap = null;
                    try {
                        bitmap = decodeSampledBitmap(uri);
                        if (bitmap == null) throw new Exception("无法读取图片");
                        String token = batchId + "-" + index + ".jpg";
                        File preview = new File(previewDirectory, token);
                        try (FileOutputStream output = new FileOutputStream(preview)) {
                            if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 84, output)) throw new Exception("无法保存预览图");
                        }
                        String text = Tasks.await(recognizer.process(InputImage.fromBitmap(bitmap, 0))).getText();
                        JSONObject image = new JSONObject();
                        image.put("token", token);
                        image.put("text", clean(text));
                        images.put(image);
                        if (!clean(text).isEmpty()) {
                            if (ocrText.length() > 0) ocrText.append("\n\n");
                            ocrText.append(clean(text));
                        }
                    } catch (Exception error) {
                        errors.put("第 " + (index + 1) + " 张图片识别失败：" + safeMessage(error));
                    } finally {
                        if (bitmap != null && !bitmap.isRecycled()) bitmap.recycle();
                    }
                }
            }
            payload.put("status", errors.length() > 0 && images.length() == 0 ? "error" : "ready");
            payload.put("ocrText", ocrText.toString());
            payload.put("images", images);
            payload.put("imageCount", images.length());
            payload.put("errors", errors);
            if (sharedText.isEmpty() && images.length() == 0) {
                payload.put("status", "error");
                errors.put("没有收到可导入的文字、链接或图片");
            }
        } catch (Exception error) {
            try {
                payload.put("status", "error");
                errors.put("快速收集失败：" + safeMessage(error));
                payload.put("errors", errors);
            } catch (Exception ignored) {
            }
        } finally {
            if (recognizer != null) recognizer.close();
        }
        return payload;
    }

    String imageData(String token) {
        if (token == null || !SAFE_TOKEN.matcher(token).matches()) return "";
        File file = new File(previewDirectory, token);
        try {
            String base = previewDirectory.getCanonicalPath() + File.separator;
            if (!file.getCanonicalPath().startsWith(base) || !file.isFile() || file.length() > 3L * 1024L * 1024L) return "";
            try (InputStream input = new FileInputStream(file); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
                return "data:image/jpeg;base64," + Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
            }
        } catch (Exception ignored) {
            return "";
        }
    }

    void destroy() {
        executor.shutdownNow();
    }

    private List<Uri> collectImageUris(Intent intent) {
        Set<Uri> unique = new LinkedHashSet<>();
        String type = clean(intent.getType());
        if (type.startsWith("image/")) {
            if (Intent.ACTION_SEND_MULTIPLE.equals(intent.getAction())) {
                ArrayList<Uri> values;
                if (Build.VERSION.SDK_INT >= 33) values = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri.class);
                else {
                    @SuppressWarnings("deprecation") ArrayList<Uri> legacy = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
                    values = legacy;
                }
                if (values != null) unique.addAll(values);
            } else {
                Uri value;
                if (Build.VERSION.SDK_INT >= 33) value = intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri.class);
                else {
                    @SuppressWarnings("deprecation") Uri legacy = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                    value = legacy;
                }
                if (value != null) unique.add(value);
            }
        }
        ClipData clipData = intent.getClipData();
        if (clipData != null) {
            for (int index = 0; index < clipData.getItemCount(); index++) {
                Uri uri = clipData.getItemAt(index).getUri();
                if (uri != null) unique.add(uri);
            }
        }
        List<Uri> result = new ArrayList<>();
        for (Uri uri : unique) {
            if (result.size() >= MAX_IMAGES) break;
            result.add(uri);
        }
        return result;
    }

    private Bitmap decodeSampledBitmap(Uri uri) throws Exception {
        BitmapFactory.Options bounds = new BitmapFactory.Options();
        bounds.inJustDecodeBounds = true;
        try (InputStream input = activity.getContentResolver().openInputStream(uri)) {
            if (input == null) throw new Exception("无法打开图片");
            BitmapFactory.decodeStream(input, null, bounds);
        }
        int sample = 1;
        while (bounds.outWidth / sample > MAX_IMAGE_EDGE * 2 || bounds.outHeight / sample > MAX_IMAGE_EDGE * 2) sample *= 2;
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inSampleSize = sample;
        Bitmap decoded;
        try (InputStream input = activity.getContentResolver().openInputStream(uri)) {
            if (input == null) throw new Exception("无法重新打开图片");
            decoded = BitmapFactory.decodeStream(input, null, options);
        }
        if (decoded == null) return null;
        int width = decoded.getWidth();
        int height = decoded.getHeight();
        int largest = Math.max(width, height);
        if (largest <= MAX_IMAGE_EDGE) return decoded;
        float ratio = MAX_IMAGE_EDGE / (float) largest;
        Bitmap scaled = Bitmap.createScaledBitmap(decoded, Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio)), true);
        if (scaled != decoded) decoded.recycle();
        return scaled;
    }

    private void cleanupOldPreviews() {
        File[] files = previewDirectory.listFiles();
        if (files == null) return;
        long threshold = System.currentTimeMillis() - PREVIEW_TTL_MS;
        for (File file : files) if (file.isFile() && file.lastModified() < threshold) file.delete();
    }

    private static String firstUrl(String value) {
        Matcher matcher = URL_PATTERN.matcher(value == null ? "" : value);
        return matcher.find() ? matcher.group() : "";
    }

    private static String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private static String safeMessage(Exception error) {
        String message = error.getMessage();
        return message == null || message.trim().isEmpty() ? "未知错误" : message;
    }
}
