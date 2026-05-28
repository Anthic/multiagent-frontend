import { JobAction, JobState } from "../types/researchState";

//inital state
export const initalJobState : JobState = {
    activeJobId : null,
    status : "idle",
    progress : 0,
    stage : "idle",
    result : null,
    error : null,
    rewrittenQueries : [],
    plan : ''

}



//the main reducer function
export const jobReducer  = (state : JobState, action : JobAction) : JobState =>{

    switch(action.type){
        //when new research starts reset queued state
        case 'START_RESEARCH' :
            return {
                ...initalJobState,
                status:'queued',
                progress: 5,
                stage : 'planner'
            }
        case 'SET_JOB_ID' :
            return{
                ...state,
                activeJobId : action.jobId,
                status : 'running'
            }
            case 'POLL_UPDATE':
      return {
        ...state,
        ...action.payload,
      };
 
    case 'DONE':
      return {
        ...state,
        status: 'done',
        progress: 100,
        result: action.result,
        rewrittenQueries: action.result?.rewritten_queries || [],
        error: null,
      };
 
    case 'FAILED':
      return {
        ...state,
        status: 'failed',
        error: action.error,
      };
 
    case 'LOAD_HISTORY':
      return {
        ...initalJobState,
        status: action.job.status as JobState['status'],
        progress: action.job.status === 'done' ? 100 : (action.job.progress || 0),
        stage: action.job.stage || 'done',
        result: action.job.result || null,
        rewrittenQueries: action.job.result?.rewritten_queries || [],
        error: null,
      };
 

    case 'RESET':
      return initalJobState;
 
    default:
      return state;
    }
}