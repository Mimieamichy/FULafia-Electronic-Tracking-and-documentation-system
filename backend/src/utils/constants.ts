export const STAGES = {
  MSC: {
    DEFAULT: 'default',
    PROPOSAL: 'proposal',
    INTERNAL: 'internal',
    EXTERNAL: 'external'
  },
  PHD: {
    DEFAULT: 'default',
    PROPOSAL_DEFENSE: 'proposal_defense',
    SECOND_SEMINAR: 'second_seminar',
    INTERNAL_DEFENSE: 'internal_defense',
    EXTERNAL_SEMINAR: 'external_defense',
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

