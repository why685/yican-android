package com.yican.recipe;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

public final class TimerReceiver extends BroadcastReceiver {
    static final String PREFS = "yican_timer_native_v1";
    static final String TIMER_STATE = "timer_state";
    static final String EXTRA_RECIPE_REF = "timer_recipe_ref";
    static final String EXTRA_STEP_INDEX = "timer_step_index";
    private static final String CHANNEL_ID = "cooking_timer";

    @Override
    public void onReceive(Context context, Intent intent) {
        StepTimerState state;
        try {
            state = StepTimerState.fromJson(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                    .getString(TIMER_STATE, ""));
        } catch (Exception ignored) {
            return;
        }
        if (state == null || state.remainingSeconds(System.currentTimeMillis()) > 0L) return;
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) return;

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(new NotificationChannel(CHANNEL_ID, "烹饪计时", NotificationManager.IMPORTANCE_HIGH));
        }
        Intent open = new Intent(context, MainActivity.class)
                .putExtra(EXTRA_RECIPE_REF, state.recipeRef)
                .putExtra(EXTRA_STEP_INDEX, state.stepIndex)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(context, 2201, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_monochrome)
                .setContentTitle("一餐：本步骤计时结束")
                .setContentText("点按返回当前烹饪步骤")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(contentIntent);
        manager.notify(2201, notification.build());
    }
}
