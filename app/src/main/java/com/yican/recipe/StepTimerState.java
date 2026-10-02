package com.yican.recipe;

import org.json.JSONObject;

final class StepTimerState {
    final String recipeRef;
    final int stepIndex;
    final long deadline;
    final int durationSeconds;

    StepTimerState(String recipeRef, int stepIndex, long deadline, int durationSeconds) {
        this.recipeRef = recipeRef;
        this.stepIndex = stepIndex;
        this.deadline = deadline;
        this.durationSeconds = durationSeconds;
    }

    static StepTimerState create(String recipeRef, int stepIndex, int durationSeconds, long now) throws Exception {
        if (recipeRef == null || !recipeRef.matches("^(builtin|custom):\\d+$")) throw new Exception("菜谱引用无效");
        if (stepIndex < 0) throw new Exception("步骤索引无效");
        if (durationSeconds < 1 || durationSeconds > 14_400) throw new Exception("计时时长须为 1 秒到 4 小时");
        return new StepTimerState(recipeRef, stepIndex, now + durationSeconds * 1000L, durationSeconds);
    }

    static StepTimerState fromJson(String value) throws Exception {
        if (value == null || value.trim().isEmpty()) return null;
        JSONObject json = new JSONObject(value);
        StepTimerState state = new StepTimerState(
                json.optString("recipeRef", ""),
                json.optInt("stepIndex", -1),
                json.optLong("deadline", -1L),
                json.optInt("durationSeconds", 0));
        if (!state.recipeRef.matches("^(builtin|custom):\\d+$") || state.stepIndex < 0 || state.deadline <= 0L
                || state.durationSeconds < 1 || state.durationSeconds > 14_400) throw new Exception("计时状态无效");
        return state;
    }

    long remainingSeconds(long now) {
        return Math.max(0L, (deadline - now + 999L) / 1000L);
    }

    JSONObject toJson(long now) {
        JSONObject json = new JSONObject();
        try {
            json.put("recipeRef", recipeRef);
            json.put("stepIndex", stepIndex);
            json.put("deadline", deadline);
            json.put("durationSeconds", durationSeconds);
            json.put("remainingSeconds", remainingSeconds(now));
            json.put("running", remainingSeconds(now) > 0L);
        } catch (Exception ignored) {
        }
        return json;
    }
}
