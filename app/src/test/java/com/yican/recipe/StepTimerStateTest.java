package com.yican.recipe;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import org.junit.Test;

public class StepTimerStateTest {
    @Test
    public void createsRoundTripsAndExpiresTimer() throws Exception {
        StepTimerState state = StepTimerState.create("builtin:2", 1, 90, 1_000L);
        assertEquals(90L, state.remainingSeconds(1_000L));
        StepTimerState restored = StepTimerState.fromJson(state.toJson(1_000L).toString());
        assertEquals("builtin:2", restored.recipeRef);
        assertEquals(0L, restored.remainingSeconds(91_001L));
    }

    @Test
    public void rejectsInvalidReferencesIndicesAndDurations() {
        assertThrows(Exception.class, () -> StepTimerState.create("bad", 0, 10, 0L));
        assertThrows(Exception.class, () -> StepTimerState.create("custom:1", -1, 10, 0L));
        assertThrows(Exception.class, () -> StepTimerState.create("custom:1", 0, 14_401, 0L));
    }
}
