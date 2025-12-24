export enum CardType {
  Emperor = 'Emperor',
  Citizen = 'Citizen',
  Slave = 'Slave',
}

export enum MatchResult {
  PlayerWin = 'PlayerWin',
  AIWin = 'AIWin',
  Draw = 'Draw',
}

export function determineResult(
  playerCard: CardType,
  aiCard: CardType,
): MatchResult {
  if (playerCard === aiCard) {
    return MatchResult.Draw
  }

  if (playerCard === CardType.Emperor && aiCard === CardType.Citizen) {
    return MatchResult.PlayerWin
  }
  if (playerCard === CardType.Citizen && aiCard === CardType.Slave) {
    return MatchResult.PlayerWin
  }
  if (playerCard === CardType.Slave && aiCard === CardType.Emperor) {
    return MatchResult.PlayerWin
  }

  if (playerCard === CardType.Citizen && aiCard === CardType.Emperor) {
    return MatchResult.AIWin
  }
  if (playerCard === CardType.Slave && aiCard === CardType.Citizen) {
    return MatchResult.AIWin
  }
  if (playerCard === CardType.Emperor && aiCard === CardType.Slave) {
    return MatchResult.AIWin
  }

  return MatchResult.Draw
}
