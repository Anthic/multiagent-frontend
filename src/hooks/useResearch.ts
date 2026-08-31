
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StartResearchPayload } from "../types/research"
import { ResearchService } from "../services/researchService"
import { useWalletStore } from "../store/walletStore"

export const researchQueryKeys  = {
 all: ['research'] as const,
  job: (jobId: string) => ['research', 'job', jobId] as const,
  history: (userId: string | undefined, limit: number) => ['research', 'history', userId ?? 'anonymous', limit] as const,
  historyById: (id: string) => ['research', 'history', id] as const,
  activeJob: ['research', 'activeJob'] as const,
}

export const useStateResearch = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: StartResearchPayload) => 
            ResearchService.startResearch(payload),
        onSuccess: (res) => {
            const jobId = res.data?.job_id
            if (jobId) {
                queryClient.setQueryData(researchQueryKeys.activeJob, jobId);
            }
            useWalletStore.getState().fetchWalletBalance();
        },
        onError: (error: any) => {
            const statusCode = error?.statusCode || error?.response?.status;
            if (statusCode === 402) {
                useWalletStore.getState().openTopUpModal(
                    10,
                    error?.message || 'Daily free research limit reached. Please top up ৳10 BDT to continue.'
                );
            }
        }
    })
}

export const useJobStatus = (jobId : string |  null) => {
 return useQuery ({
    queryKey : researchQueryKeys.job(jobId ?? ''),
    queryFn : ()=> ResearchService.getJobStatus(jobId!),
    enabled : !!jobId,
    refetchInterval: ( query ) =>{
        const status = query.state.data?.data?.status
        if (status === 'done' || status === "failed") return false

        return 2000  // 2s polling — fast enough for both modes, minimal detection lag
      
    },
    staleTime : 5000
 })
}


export const useResearchHistory = (userId?: string, limit = 10, enabled = true) => {
    return useQuery({
        // A history response is private to an account. Including the user ID prevents
        // React Query from showing a previous account's cached sessions after sign-out.
        queryKey: researchQueryKeys.history(userId, limit),
        queryFn: () => ResearchService.getHistory(limit),
        enabled: enabled && !!userId,
        staleTime: 0,
        refetchInterval: 3500, // Real-time polling every 3.5s
        refetchOnWindowFocus: true,
        refetchOnMount: 'always',
    });
};


export const useResearchById = (id : string) => {
    return useQuery ( {
        queryKey : researchQueryKeys.historyById(id ?? ''),
        queryFn : () => ResearchService.getHistoryById(id),
        enabled : !!id 
    })
}
