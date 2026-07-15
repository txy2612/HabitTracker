import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../../../api/apiClient";
import type { HabitLog } from "../../../shared/types/api.types";
import { getRecentDays } from "../../../shared/utils/dateUtils";

//eg: completedDays: 5, totlaDays: 7, percentage: 71
// why use types: w/o type, diff parts of app might acci use diff names
// but UI might expect: stats.completedDays
// export type is only used for type checking, not value
export type CompletionPeriodStats = {
    completedDays: number;
    totalDays: number;
    percentage: number;
}

// both completionstats: 7 & 30 days must follow shape of CompletionPeriodStats
// instead of defining twice, just reuse structure
export type CompletionStats = {
    lastSevenDays: CompletionPeriodStats;
    lastThirtyDays: CompletionPeriodStats;
}

// & = add new fields
// UseCompletionStatsResult CONTAINS: last7days, last30days, isLoading, error, refresh
// using & AVOID REPEATING first two properties
/* WHY SEPARATE CompletionStats and UseCompletionStatsResult?
- CS : the analytics data
- UCSR: ana data + REQUEST STATE [req still running? did req fail? can data be fetched again?]
 */
export type UseCompletionStatsResult = CompletionStats & {
    isLoading: boolean;
    error: string | null;
    // null = NO error
    // const [error, setError] = useState<string | null>(null);
    refresh: () => Promise<void>;
    // function name, no para, takes time + return no useful data
    // we call it 'await refresh()'
    // instead of receiving result 'const stats = await refresh();'
};

// const EMPTY_COMPLETION_STATS: CompletionStats
// tells TS: This value must follow the CompletionStats structure
// { completedDays: 0,} would cause an error
/*
WHY CREATE THIS CONSTANT?

useState() needs an initial value before the backend finishes loading.

Without this, stats would be null and we'd constantly need:

if (!stats) ...

Instead, React starts with EMPTY_COMPLETION_STATS,
then later replaces it with the real statistics after setStats().
*/
const EMPTY_COMPLETION_STATS: CompletionStats = {
    lastSevenDays: { completedDays: 0, totalDays: 7, percentage: 0},
    lastThirtyDays: { completedDays: 0, totalDays: 30, percentage: 0},
}



function calculateCompletionPeriod(
    logs: HabitLog[],
    periodDates: string[],
    ): CompletionPeriodStats {
    
    // Set =/ a collection of uniq val
    // Why use Set? 
    // 'dateSet.has(date)' faster than 'periodDates.includes(date)'
    //especially when many logs are checked.
    const dateSet = new Set(periodDates);

    // another set
    const completedDates = new Set(
        logs// filter() : which habit should stay?(log) => : for each log
        .filter((log) => log.status === "done" && dateSet.has(log.logDate))//map -> ev item -> smtg else
        .map((log) => log.logDate),
    );

    // suppose completedDates = 16th, 17th, 18th -> completedDays = 3
    const completedDays = completedDates.size;
    const totalDays = periodDates.length;

    return {
        completedDays,
        totalDays,
        percentage: totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100),
    };
}

// why start w 'use'? -> every hook shud start w 'use' useState(), useEffect(), useCompletionStats(), useReminder()
export function useCompletionStats(habitId: string): UseCompletionStatsResult {
    // use... = React hooks
    // [stats, setStates] -> js array DESTRCTURING
    const [stats, setStats] = useState<CompletionStats>(EMPTY_COMPLETION_STATS);
    // Typescript looks at 'false' -> infer it as boolean
    const [isLoading, setIsLoading] = useState(false);
    // Why specify type here? 
    // if we do useState(null) -> later cant do setError("Network error")
    const [error, setError] = useState<string | null>(null);
    // useRef
    const requestIdRef = useRef(0);

    const refresh = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        try {
        setIsLoading(true);
        setError(null);

        const lastThirtyDates = getRecentDays(30);
        const lastSevenDates = lastThirtyDates.slice(-7);
        const months = [...new Set(lastThirtyDates.map((date) => date.slice(0, 7)))];
        const monthlyLogs = await Promise.all(
            months.map((month) => apiClient.getLogs(habitId, month)),
        );

        if (requestId !== requestIdRef.current) {
            return;
        }

        const logs = monthlyLogs.flat();
        setStats({
            lastSevenDays: calculateCompletionPeriod(logs, lastSevenDates),
            lastThirtyDays: calculateCompletionPeriod(logs, lastThirtyDates),
        });
        } catch (fetchError) {
        if (requestId === requestIdRef.current) {
            setError(
            fetchError instanceof Error
                ? fetchError.message
                : "Failed to load completion statistics.",
            );
        }
        } finally {
        if (requestId === requestIdRef.current) {
            setIsLoading(false);
        }
        }
    }, [habitId]);

    useEffect(() =>{
        void refresh();

        return () =>{
            requestIdRef.current += 1;
        };
    }, [refresh]);

    return {
        ...stats,
        isLoading,
        error,
        refresh,
    };
}
