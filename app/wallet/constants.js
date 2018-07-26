// Constants copied from exccd/chaincfg/params.go

export const TestNetParams = {
  TicketMaturity: 16,
  TicketExpiry: 6144, // 6*TicketPoolSize
  CoinbaseMaturity: 16,
  SStxChangeMaturity: 1,
  GenesisTimestamp: 1532420489,
  TargetTimePerBlock: 2.5 * 60 // in seconds
};

export const MainNetParams = {
  TicketMaturity: 256,
  TicketExpiry: 40960, // 5*TicketPoolSize
  CoinbaseMaturity: 256,
  SStxChangeMaturity: 1,
  GenesisTimestamp: 1531731600,
  TargetTimePerBlock: 2.5 * 60 // in seconds
};
