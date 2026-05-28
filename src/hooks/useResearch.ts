
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StartResearchPayload } from "../types/research"
import { ResearchService } from "../services/researchService"

export const researchQueryKeys  = {
 all: ['research'] as const,
  job: (jobId: string) => ['research', 'job', jobId] as const,
  history: (limit: number) => ['research', 'history', limit] as const,
  historyById: (id: string) => ['research', 'history', id] as const,
  activeJob: ['research', 'activeJob'] as const,
}

export const  useStateResearch =() => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn : (payload : StartResearchPayload) => 
            ResearchService.startResearch(payload),
        onSuccess : (res) => {
            const jobId = res.data?.job_id
            if (jobId) {
                queryClient.setQueryData(researchQueryKeys.activeJob, jobId);
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

        return 5000
      
    },
    staleTime : 5000
 })
}


export const useResearchHistory = (limit = 10) => {
    return useQuery ( {
        queryKey : researchQueryKeys.history(limit),
        queryFn : () => ResearchService.getHistory(limit)
    })
}

export const useResearchById = (id : string) => {
    return useQuery ( {
        queryKey : researchQueryKeys.historyById(id ?? ''),
        queryFn : () => ResearchService.getHistoryById(id),
        enabled : !!id 
    })
}