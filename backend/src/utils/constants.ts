export const STAGES = {
  MSC: {
    START: 'start',
    PROPOSAL: 'proposal',
    INTERNAL: 'internal',
    EXTERNAL: 'external',
    COMPLETED: 'completed'
  },
  PHD: {
    START: 'start',
    PROPOSAL_DEFENSE: 'proposal_defense',
    SECOND_SEMINAR: 'second_seminar',
    INTERNAL_DEFENSE: 'internal_defense',
    EXTERNAL_SEMINAR: 'external_defense',
    COMPLETED: 'completed'
  }
};

export const PROVOST_STAGES = {
  MSC: ['external'],
  PHD: ['second_seminar', 'internal_defense', 'external_defense']
};


export const EXTERNAL_EXAMINER_STAGES = {
  MSC: ['external'],
  PHD: ['external_defense']
};

//provost adds pg rep (internal and external) for msc 
//then phd (all stages pgrep is added by provost)

