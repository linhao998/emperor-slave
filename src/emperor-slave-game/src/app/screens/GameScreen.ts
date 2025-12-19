export type GameScreenHandlers = {
  onExitToHome: () => void
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

  const aiPositions = [25, 150, 275, 400, 520]
  aiPositions.forEach((left, index) => {
    const card = document.createElement('div')
    card.className = 'card ai-card'
    card.style.left = `${left}px`
    card.style.top = '25px'
    card.textContent = 'back'
    card.setAttribute('data-index', String(index))
    aiHand.appendChild(card)
  })

  const battleArea = document.createElement('div')
  battleArea.className = 'battle-area'

  const aiBattleCard = document.createElement('div')
  aiBattleCard.className = 'card battle-card'
  aiBattleCard.style.left = '670px'
  aiBattleCard.style.top = '230px'
  aiBattleCard.textContent = ''

  const playerBattleCard = document.createElement('div')
  playerBattleCard.className = 'card battle-card'
  playerBattleCard.style.left = '670px'
  playerBattleCard.style.top = '420px'
  playerBattleCard.textContent = ''

  battleArea.append(aiBattleCard, playerBattleCard)

  const playerHand = document.createElement('div')
  playerHand.className = 'player-hand'

  const playerCards = [
    { left: 820, label: 'emperor' },
    { left: 945, label: 'slave' },
    { left: 1070, label: 'citizen' },
    { left: 1195, label: 'citizen' },
    { left: 1315, label: 'citizen' },
  ]
  playerCards.forEach((item, index) => {
    const card = document.createElement('div')
    card.className = 'card player-card'
    card.style.left = `${item.left}px`
    card.style.top = '625px'
    card.textContent = item.label
    card.setAttribute('data-index', String(index))
    playerHand.appendChild(card)
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

  screen.append(aiHand, battleArea, playerHand, controlArea, pauseModal)
  container.appendChild(screen)

  function showPause(): void {
    pauseModal.classList.add('is-visible')
    pauseModal.setAttribute('aria-hidden', 'false')
  }

  function hidePause(): void {
    pauseModal.classList.remove('is-visible')
    pauseModal.setAttribute('aria-hidden', 'true')
  }
}
