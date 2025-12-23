import { CardType, MatchResult, determineResult } from '../../rules/determineResult'

export type GameScreenHandlers = {
  onExitToHome: () => void
}

type Card = {
  id: string
  type: CardType
  owner: 'player' | 'ai'
  used: boolean
}

type FlyingCardHandle = {
  element: HTMLDivElement
  deltaX: number
  deltaY: number
  done: Promise<void>
  cleanup: () => void
}

enum GameState {
  Selecting = 'Selecting',
  Confirmed = 'Confirmed',
  Resolving = 'Resolving',
  ResultAnimating = 'ResultAnimating',
  ResultReady = 'ResultReady',
}

export function renderGame(
  container: HTMLElement,
  handlers: GameScreenHandlers,
): void {
  container.innerHTML = ''

  const screen = document.createElement('div')
  screen.className = 'game-screen'

  const aiHand = document.createElement('div')
  aiHand.className = 'ai-hand'

  let aiHandCards: Card[] = []
  const aiCardElements: HTMLDivElement[] = []
  const aiCardPositions = [25, 170, 315, 460, 600]
  const aiTop = 25
  aiCardPositions.forEach((left, index) => {
    const card = document.createElement('div')
    card.className = 'card ai-card'
    card.style.left = `${left}px`
    card.style.top = `${aiTop}px`
    card.textContent = 'back'
    card.setAttribute('data-index', String(index))
    aiHand.appendChild(card)
    aiCardElements.push(card)
  })

  const battleArea = document.createElement('div')
  battleArea.className = 'battle-area'

  const battlePositions = {
    ai: { left: 670, top: 230 },
    player: { left: 670, top: 420 },
  }

  const aiBattleCard = document.createElement('div')
  aiBattleCard.className = 'card battle-card is-hidden'
  aiBattleCard.style.left = `${battlePositions.ai.left}px`
  aiBattleCard.style.top = `${battlePositions.ai.top}px`
  aiBattleCard.textContent = ''

  const playerBattleCard = document.createElement('div')
  playerBattleCard.className = 'card battle-card is-hidden'
  playerBattleCard.style.left = `${battlePositions.player.left}px`
  playerBattleCard.style.top = `${battlePositions.player.top}px`
  playerBattleCard.textContent = ''

  const battleResultText = document.createElement('div')
  battleResultText.className = 'battle-result'

  battleArea.append(aiBattleCard, playerBattleCard, battleResultText)

  const playerHand = document.createElement('div')
  playerHand.className = 'player-hand'

  let playerHandCards: Card[] = []
  const playerTop = 595
  const playerSlots = [
    { left: 720, cardId: 'P-E' },
    { left: 865, cardId: 'P-S' },
    { left: 1010, cardId: 'P-C1' },
    { left: 1155, cardId: 'P-C2' },
    { left: 1295, cardId: 'P-C3' },
  ]
  const playerSlotPositionsByIndex = playerSlots.map((slot) => ({
    left: slot.left,
    top: playerTop,
  }))
  let playerSlotIndexById: Record<string, number> = {}
  const playerCardElements: Array<{
    element: HTMLDivElement
    cardId: string
  }> = []
  const playerCardElementById = new Map<string, HTMLDivElement>()
  playerSlots.forEach((slot, index) => {
    playerSlotIndexById[slot.cardId] = index
    const card = document.createElement('div')
    card.className = 'card player-card'
    card.style.left = `${slot.left}px`
    card.style.top = `${playerTop}px`
    card.textContent = ''
    card.setAttribute('data-index', String(index))
    card.setAttribute('data-card', slot.cardId)
    card.addEventListener('click', () => {
      if (currentState !== GameState.Selecting) {
        return
      }
      const selectedCard = getPlayerCardById(slot.cardId)
      if (!selectedCard || selectedCard.used) {
        return
      }
      if (selectedPlayerCardId === selectedCard.id) {
        playerCard = selectedCard
        setGameState(GameState.Confirmed)
        setGameState(GameState.Resolving)
        return
      }
      selectedPlayerCardId = selectedCard.id
      playerCard = selectedCard
      updateSelectedCard()
      updateStateUI()
    })
    card.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'left') {
        return
      }
      card.classList.remove('is-shifting')
    })
    playerHand.appendChild(card)
    playerCardElements.push({ element: card, cardId: slot.cardId })
    playerCardElementById.set(slot.cardId, card)
  })

  const controlArea = document.createElement('div')
  controlArea.className = 'control-area'

  const pauseButton = document.createElement('button')
  pauseButton.type = 'button'
  pauseButton.className = 'pause-button'
  pauseButton.setAttribute('aria-label', '暂停')
  pauseButton.innerHTML = `
    <svg aria-hidden="true" width="55" height="55" viewBox="0 0 55 55">
      <g transform="matrix(1 0 0 1 -1346 -20)">
        <path d="M 13.6962890625 3.68815104166666  C 17.9096137152778 1.22938368055555  22.5108506944444 0  27.5 0  C 32.4891493055556 0  37.0903862847222 1.22938368055555  41.3037109375 3.68815104166666  C 45.5170355902778 6.14691840277777  48.8530815972222 9.48296440972222  51.3118489583333 13.6962890625  C 53.7706163194444 17.9096137152778  55 22.5108506944444  55 27.5  C 55 32.4891493055556  53.7706163194444 37.0903862847222  51.3118489583333 41.3037109375  C 48.8530815972222 45.5170355902778  45.5170355902778 48.8530815972222  41.3037109375 51.3118489583333  C 37.0903862847222 53.7706163194445  32.4891493055556 55  27.5 55  C 22.5108506944444 55  17.9096137152778 53.7706163194445  13.6962890625 51.3118489583333  C 9.48296440972222 48.8530815972222  6.14691840277778 45.5170355902778  3.68815104166667 41.3037109375  C 1.22938368055556 37.0903862847222  0 32.4891493055556  0 27.5  C 0 22.5108506944444  1.22938368055556 17.9096137152778  3.68815104166667 13.6962890625  C 6.14691840277778 9.48296440972222  9.48296440972222 6.14691840277777  13.6962890625 3.68815104166666  Z M 17.724609375 44.365234375  C 20.7085503472222 46.1078559027778  23.9670138888889 46.9791666666667  27.5 46.9791666666667  C 31.0329861111111 46.9791666666667  34.2914496527778 46.1078559027778  37.275390625 44.365234375  C 40.2593315972222 42.6226128472222  42.6226128472222 40.2593315972222  44.365234375 37.275390625  C 46.1078559027778 34.2914496527778  46.9791666666667 31.0329861111111  46.9791666666667 27.5  C 46.9791666666667 23.9670138888889  46.1078559027778 20.7085503472222  44.365234375 17.724609375  C 42.6226128472222 14.7406684027778  40.2593315972222 12.3773871527778  37.275390625 10.634765625  C 34.2914496527778 8.89214409722222  31.0329861111111 8.02083333333334  27.5 8.02083333333334  C 23.9670138888889 8.02083333333334  20.7085503472222 8.89214409722222  17.724609375 10.634765625  C 14.7406684027778 12.3773871527778  12.3773871527778 14.7406684027778  10.634765625 17.724609375  C 8.89214409722222 20.7085503472222  8.02083333333333 23.9670138888889  8.02083333333333 27.5  C 8.02083333333333 31.0329861111111  8.89214409722222 34.2914496527778  10.634765625 37.275390625  C 12.3773871527778 40.2593315972222  14.7406684027778 42.6226128472222  17.724609375 44.365234375  Z M 37.8125 38.9583333333333  L 30.9375 38.9583333333333  C 30.6032986111111 38.9583333333333  30.3287760416667 38.8509114583333  30.1139322916667 38.6360677083333  C 29.8990885416667 38.4212239583333  29.7916666666667 38.1467013888889  29 37.8125  L 29 17.1875  C 29.7916666666667 16.8532986111111  29.8990885416667 16.5787760416667  30.1139322916667 16.3639322916667  C 30.3287760416667 16.1490885416667  30.6032986111111 16.0416666666667  30.9375 16.0416666666667  L 37.8125 16.0416666666667  C 38.1467013888889 16.0416666666667  38.4212239583333 16.1490885416667  38.6360677083333 16.3639322916667  C 38.8509114583333 16.5787760416667  38.9583333333333 16.8532986111111  39 17.1875  L 39 37.8125  C 38.9583333333333 38.1467013888889  38.8509114583333 38.4212239583333  38.6360677083333 38.6360677083333  C 38.4212239583333 38.8509114583333  38.1467013888889 38.9583333333333  37.8125 38.9583333333333  Z M 24.0625 38.9583333333333  L 17.1875 38.9583333333333  C 16.8532986111111 38.9583333333333  16.5787760416667 38.8509114583333  16.3639322916667 38.6360677083333  C 16.1490885416667 38.4212239583333  16.0416666666667 38.1467013888889  16 37.8125  L 16 17.1875  C 16.0416666666667 16.8532986111111  16.1490885416667 16.5787760416667  16.3639322916667 16.3639322916667  C 16.5787760416667 16.1490885416667  16.8532986111111 16.0416666666667  17.1875 16.0416666666667  L 24.0625 16.0416666666667  C 24.3967013888889 16.0416666666667  24.6712239583333 16.1490885416667  24.8860677083333 16.3639322916667  C 25.1009114583333 16.5787760416667  25.2083333333333 16.8532986111111  26 17.1875  L 26 37.8125  C 25.2083333333333 38.1467013888889  25.1009114583333 38.4212239583333  24.8860677083333 38.6360677083333  C 24.6712239583333 38.8509114583333  24.3967013888889 38.9583333333333  24.0625 38.9583333333333  Z " fill-rule="nonzero" fill="#000000" stroke="none" fill-opacity="0.63921568627451" transform="matrix(1 0 0 1 1346 20 )" />
      </g>
    </svg>
  `
  pauseButton.addEventListener('click', () => {
    showPause()
  })

  controlArea.appendChild(pauseButton)

  const pauseModal = document.createElement('div')
  pauseModal.className = 'pause-modal'
  pauseModal.setAttribute('aria-hidden', 'true')

  const pauseDialog = document.createElement('div')
  pauseDialog.className = 'pause-dialog'

  const pauseTitle = document.createElement('div')
  pauseTitle.className = 'pause-title'
  pauseTitle.textContent = '已暂停'

  const pauseActions = document.createElement('div')
  pauseActions.className = 'pause-actions'

  const resumeButton = document.createElement('button')
  resumeButton.type = 'button'
  resumeButton.className = 'pause-action'
  resumeButton.textContent = '继续游戏'
  resumeButton.addEventListener('click', () => {
    hidePause()
  })

  const restartButton = document.createElement('button')
  restartButton.type = 'button'
  restartButton.className = 'pause-action'
  restartButton.textContent = '重新开始'
  restartButton.addEventListener('click', () => {
    hidePause()
    resetGame()
  })

  const homeButton = document.createElement('button')
  homeButton.type = 'button'
  homeButton.className = 'pause-action'
  homeButton.textContent = '返回首页'
  homeButton.addEventListener('click', () => {
    hidePause()
    handlers.onExitToHome()
  })

  pauseActions.append(resumeButton, restartButton, homeButton)
  pauseDialog.append(pauseTitle, pauseActions)
  pauseModal.appendChild(pauseDialog)

  const resultModal = document.createElement('div')
  resultModal.className = 'result-modal'
  resultModal.setAttribute('aria-hidden', 'true')

  const resultDialog = document.createElement('div')
  resultDialog.className = 'result-dialog'

  const resultMessage = document.createElement('div')
  resultMessage.className = 'result-message'

  const resultActions = document.createElement('div')
  resultActions.className = 'result-actions'

  const playAgainButton = document.createElement('button')
  playAgainButton.type = 'button'
  playAgainButton.className = 'result-button'
  playAgainButton.textContent = '再来一局'
  playAgainButton.addEventListener('click', () => {
    resetGame()
  })

  const backHomeButton = document.createElement('button')
  backHomeButton.type = 'button'
  backHomeButton.className = 'result-button'
  backHomeButton.textContent = '回到主页'
  backHomeButton.addEventListener('click', () => {
    resetGame()
    handlers.onExitToHome()
  })

  resultActions.append(playAgainButton, backHomeButton)
  resultModal.append(resultDialog, resultMessage, resultActions)

  screen.append(aiHand, battleArea, playerHand, controlArea, pauseModal, resultModal)
  container.appendChild(screen)

  let currentState: GameState = GameState.Selecting
  let playerCard: Card | null = null
  let selectedPlayerCardId: string | null = null
  let aiCard: Card | null = null
  let matchResult: MatchResult | null = null
  let roundCount = 0
  let battleStageReady = false
  const maxRounds = 5
  const arrivalHoldMs = 1000
  const battleFlipDurationMs = 600
  const drawHoldMs = 1000
  const resultHoldMs = 1500
  const battleFadeDurationMs = 300
  const battleCollisionOffsetPx = 15
  const battleCollisionDurationMs = 120
  const battleCollisionHoldMs = 100

  aiBattleCard.style.setProperty(
    '--battle-collision-offset',
    `${battleCollisionOffsetPx}px`,
  )
  playerBattleCard.style.setProperty(
    '--battle-collision-offset',
    `-${battleCollisionOffsetPx}px`,
  )

  const logStateChange = (label: string, nextState: GameState): void => {
    console.log(label, {
      from: currentState,
      to: nextState,
      playerCard: playerCard ? `${playerCard.id}/${playerCard.type}` : null,
      aiCard: aiCard ? `${aiCard.id}/${aiCard.type}` : null,
      matchResult,
    })
  }

  const setGameState = (nextState: GameState): void => {
    logStateChange('[GameState] before', nextState)
    if (nextState === GameState.Resolving) {
      if (!playerCard) {
        return
      }
      roundCount += 1
      playerCard.used = true
      aiCard = drawRandomCard(aiHandCards)
      if (!aiCard) {
        return
      }
      aiCard.used = true
      matchResult = determineResult(playerCard.type, aiCard.type)
      battleStageReady = false
      currentState = GameState.ResultAnimating
      updateStateUI()
      startBattleSequence()
      logStateChange('[GameState] after', currentState)
      return
    }
    if (nextState === GameState.ResultReady) {
      currentState = nextState
      updateStateUI()
      if (matchResult) {
        resultMessage.textContent = getResultLabel(matchResult)
      }
      logStateChange('[GameState] after', currentState)
      return
    }

    currentState = nextState
    updateStateUI()
    logStateChange('[GameState] after', currentState)
  }

  resetGame()

  function showPause(): void {
    pauseModal.classList.add('is-visible')
    pauseModal.setAttribute('aria-hidden', 'false')
  }

  function hidePause(): void {
    pauseModal.classList.remove('is-visible')
    pauseModal.setAttribute('aria-hidden', 'true')
  }

  function createPlayerHand(): Card[] {
    return [
      { id: 'P-E', type: CardType.Emperor, owner: 'player', used: false },
      { id: 'P-S', type: CardType.Slave, owner: 'player', used: false },
      { id: 'P-C1', type: CardType.Citizen, owner: 'player', used: false },
      { id: 'P-C2', type: CardType.Citizen, owner: 'player', used: false },
      { id: 'P-C3', type: CardType.Citizen, owner: 'player', used: false },
    ]
  }

  function createAiHand(): Card[] {
    return [
      { id: 'A-C1', type: CardType.Citizen, owner: 'ai', used: false },
      { id: 'A-C2', type: CardType.Citizen, owner: 'ai', used: false },
      { id: 'A-C3', type: CardType.Citizen, owner: 'ai', used: false },
      { id: 'A-E', type: CardType.Emperor, owner: 'ai', used: false },
      { id: 'A-S', type: CardType.Slave, owner: 'ai', used: false },
    ]
  }

  function getPlayerCardById(cardId: string): Card | null {
    return playerHandCards.find((card) => card.id === cardId) ?? null
  }

  function syncHandsUI(): void {
    playerCardElements.forEach(({ element, cardId }) => {
      const card = getPlayerCardById(cardId)
      if (!card) {
        return
      }
      element.textContent = card.type.toLowerCase()
      element.setAttribute('data-card', card.id)
    })
    aiCardElements.forEach((element, index) => {
      const card = aiHandCards[index]
      if (!card) {
        return
      }
      element.setAttribute('data-card', card.id)
    })
  }

  function resetGame(): void {
    playerHandCards = createPlayerHand()
    aiHandCards = createAiHand()
    playerCard = null
    aiCard = null
    matchResult = null
    selectedPlayerCardId = null
    roundCount = 0
    battleStageReady = false
    currentState = GameState.Selecting
    resetBattleCards()
    resetHandLayout()
    resetAiHandLayout()
    resultMessage.textContent = ''
    syncHandsUI()
    updateSelectedCard()
    updateStateUI()
  }

  function resetHandLayout(): void {
    playerSlotIndexById = {}
    playerSlots.forEach((slot, index) => {
      playerSlotIndexById[slot.cardId] = index
      const element = playerCardElementById.get(slot.cardId)
      if (!element) {
        return
      }
      element.classList.remove('is-used', 'is-shifting')
      element.style.visibility = 'visible'
      element.style.left = `${playerSlotPositionsByIndex[index].left}px`
      element.style.top = `${playerSlotPositionsByIndex[index].top}px`
    })
  }

  function resetAiHandLayout(): void {
    aiCardElements.forEach((element, index) => {
      element.classList.remove('is-used')
      element.style.visibility = 'visible'
      element.style.left = `${aiCardPositions[index]}px`
      element.style.top = `${aiTop}px`
    })
  }

  function resetRoundSelection(): void {
    playerCard = null
    selectedPlayerCardId = null
    aiCard = null
    matchResult = null
    battleStageReady = false
    currentState = GameState.Selecting
    resultMessage.textContent = ''
    updateSelectedCard()
    updateStateUI()
  }


  function resetBattleCards(): void {
    aiBattleCard.classList.add('is-hidden')
    playerBattleCard.classList.add('is-hidden')
    aiBattleCard.classList.remove('is-back', 'enter', 'is-colliding', 'is-appearing')
    playerBattleCard.classList.remove('enter', 'is-colliding', 'is-appearing')
    aiBattleCard.textContent = ''
    playerBattleCard.textContent = ''
    aiBattleCard.removeAttribute('data-face')
    playerBattleCard.removeAttribute('data-face')
    battleResultText.textContent = ''
    aiBattleCard.style.left = `${battlePositions.ai.left}px`
    aiBattleCard.style.top = `${battlePositions.ai.top}px`
    playerBattleCard.style.left = `${battlePositions.player.left}px`
    playerBattleCard.style.top = `${battlePositions.player.top}px`
  }

  function updateBattleStageVisibility(): void {
    if (battleStageReady) {
      aiBattleCard.classList.remove('is-hidden')
      playerBattleCard.classList.remove('is-hidden')
      return
    }
    aiBattleCard.classList.add('is-hidden')
    playerBattleCard.classList.add('is-hidden')
  }

  function runBattleCollision(): Promise<void> {
    return new Promise((resolve) => {
      aiBattleCard.classList.add('is-colliding')
      playerBattleCard.classList.add('is-colliding')
      window.setTimeout(() => {
        aiBattleCard.classList.remove('is-colliding')
        playerBattleCard.classList.remove('is-colliding')
        window.setTimeout(resolve, battleCollisionDurationMs)
      }, battleCollisionDurationMs + battleCollisionHoldMs)
    })
  }

  function createFlyingCard(
    source: HTMLElement,
    target: HTMLElement,
    text: string,
    isBack: boolean,
    face?: CardType,
  ): FlyingCardHandle {
    const start = source.getBoundingClientRect()
    const destination = target.getBoundingClientRect()
    const flying = document.createElement('div')
    flying.className = 'flying-card'
    if (isBack) {
      flying.classList.add('is-back')
    }
    if (face) {
      flying.setAttribute('data-face', face)
    }
    flying.textContent = text
    flying.style.left = `${start.left}px`
    flying.style.top = `${start.top}px`
    flying.style.width = `${start.width}px`
    flying.style.height = `${start.height}px`
    document.body.appendChild(flying)

    const startCenterX = start.left + start.width / 2
    const startCenterY = start.top + start.height / 2
    const targetCenterX = destination.left + destination.width / 2
    const targetCenterY = destination.top + destination.height / 2
    const deltaX = targetCenterX - startCenterX
    const deltaY = targetCenterY - startCenterY

    let resolveDone: () => void
    const done = new Promise<void>((resolve) => {
      resolveDone = resolve
    })

    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.propertyName !== 'transform') {
        return
      }
      flying.removeEventListener('transitionend', handleTransitionEnd)
      resolveDone()
    }

    flying.addEventListener('transitionend', handleTransitionEnd)

    const cleanup = (): void => {
      flying.removeEventListener('transitionend', handleTransitionEnd)
      flying.remove()
    }

    return {
      element: flying,
      deltaX,
      deltaY,
      done,
      cleanup,
    }
  }

  function startFlyingCards(cards: FlyingCardHandle[]): void {
    requestAnimationFrame(() => {
      cards.forEach((card) => {
        card.element.style.transform = `translate(${card.deltaX}px, ${card.deltaY}px)`
      })
    })
  }

  function hidePlayerCardInHand(cardId: string): void {
    const element = playerCardElementById.get(cardId)
    if (!element) {
      return
    }
    element.classList.add('is-used')
    element.style.visibility = 'hidden'
  }

  function hideAiCardInHand(index: number): void {
    const element = aiCardElements[index]
    if (!element) {
      return
    }
    element.classList.add('is-used')
    element.style.visibility = 'hidden'
  }

  function getNextAiAnimationIndex(): number | null {
    for (let index = aiCardElements.length - 1; index >= 0; index -= 1) {
      const element = aiCardElements[index]
      if (!element || element.classList.contains('is-used')) {
        continue
      }
      return index
    }
    return null
  }

  function updatePlayerHandPositions(): void {
    Object.keys(playerSlotIndexById).forEach((cardId) => {
      const index = playerSlotIndexById[cardId]
      const position = playerSlotPositionsByIndex[index]
      const element = playerCardElementById.get(cardId)
      if (!position || !element) {
        return
      }
      element.classList.add('is-shifting')
      element.style.left = `${position.left}px`
      element.style.top = `${position.top}px`
    })
  }

  function shiftPlayerHandAfterPlay(cardId: string): void {
    const removedIndex = playerSlotIndexById[cardId]
    if (removedIndex === undefined) {
      return
    }
    delete playerSlotIndexById[cardId]
    Object.keys(playerSlotIndexById).forEach((id) => {
      if (playerSlotIndexById[id] < removedIndex) {
        playerSlotIndexById[id] += 1
      }
    })
    updatePlayerHandPositions()
  }

  function startBattleSequence(): void {
    if (!playerCard || !aiCard || !matchResult) {
      return
    }
    const playerCardSnapshot = playerCard
    const aiCardSnapshot = aiCard
    const matchSnapshot = matchResult
    const roundSnapshot = roundCount
    const playerElement = playerCardElementById.get(playerCardSnapshot.id)
    const aiIndex = getNextAiAnimationIndex()
    if (!playerElement || aiIndex === null) {
      return
    }
    const aiElement = aiCardElements[aiIndex]
    if (!aiElement) {
      return
    }
    const playerCardLabel = playerElement.textContent ?? ''

    resetBattleCards()

    const playerFlying = createFlyingCard(
      playerElement,
      playerBattleCard,
      playerCardLabel,
      false,
      playerCardSnapshot.type,
    )
    const aiFlying = createFlyingCard(aiElement, aiBattleCard, 'back', true)

    hidePlayerCardInHand(playerCardSnapshot.id)
    shiftPlayerHandAfterPlay(playerCardSnapshot.id)
    hideAiCardInHand(aiIndex)

    startFlyingCards([playerFlying, aiFlying])

    Promise.all([playerFlying.done, aiFlying.done]).then(() => {
      playerBattleCard.textContent = playerCardLabel
      aiBattleCard.textContent = 'back'
      playerBattleCard.setAttribute('data-face', playerCardSnapshot.type)
      aiBattleCard.setAttribute('data-face', aiCardSnapshot.type)
      aiBattleCard.classList.add('is-back')
      playerBattleCard.classList.add('is-appearing')
      aiBattleCard.classList.add('is-appearing')
      battleStageReady = true
      updateBattleStageVisibility()
      playerFlying.element.style.opacity = '0'
      aiFlying.element.style.opacity = '0'
      requestAnimationFrame(() => {
        playerBattleCard.classList.remove('is-appearing')
        aiBattleCard.classList.remove('is-appearing')
        playerFlying.cleanup()
        aiFlying.cleanup()
      })

      window.setTimeout(() => {
        aiBattleCard.classList.remove('is-back')
        aiBattleCard.textContent = aiCardSnapshot.type

        window.setTimeout(() => {
          runBattleCollision().then(() => {
            if (matchSnapshot === MatchResult.Draw && roundSnapshot < maxRounds) {
              window.setTimeout(() => {
                battleStageReady = false
                updateBattleStageVisibility()
                window.setTimeout(() => {
                  resetRoundSelection()
                  resetBattleCards()
                }, battleFadeDurationMs)
              }, drawHoldMs)
              return
            }

            window.setTimeout(() => {
              setGameState(GameState.ResultReady)
            }, resultHoldMs)
          })
        }, battleFlipDurationMs)
      }, arrivalHoldMs)
    })
  }

  function drawRandomCard(hand: Card[]): Card | null {
    const available = hand.filter((card) => !card.used)
    if (available.length === 0) {
      return null
    }
    const index = Math.floor(Math.random() * available.length)
    return available[index]
  }

  function updateSelectedCard(): void {
    playerCardElements.forEach(({ element, cardId }) => {
      element.classList.toggle('is-selected', selectedPlayerCardId === cardId)
    })
  }

  function updateStateUI(): void {
    playerHand.classList.toggle('is-locked', currentState !== GameState.Selecting)
    battleArea.classList.toggle(
      'show',
      currentState === GameState.ResultAnimating,
    )
    updateBattleStageVisibility()
    if (currentState === GameState.ResultReady) {
      resultModal.classList.add('is-visible')
      resultModal.setAttribute('aria-hidden', 'false')
    } else {
      resultModal.classList.remove('is-visible')
      resultModal.setAttribute('aria-hidden', 'true')
    }
  }

  function getResultLabel(result: MatchResult): string {
    if (result === MatchResult.PlayerWin) {
      return '你赢了'
    }
    if (result === MatchResult.AIWin) {
      return '你输了'
    }
    return '平局'
  }
}
