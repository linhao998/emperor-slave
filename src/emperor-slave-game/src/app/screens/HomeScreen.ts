export type NavigateHandler = (target: string) => void

export function renderHome(
  container: HTMLElement,
  onNavigate: NavigateHandler,
): void {
  container.innerHTML = ''

  const title = document.createElement('h1')
  title.textContent = 'Emperor-Slave Game'

  const buttonGroup = document.createElement('div')
  buttonGroup.className = 'home-actions'

  const startButton = document.createElement('button')
  startButton.type = 'button'
  startButton.textContent = '开始游戏'
  startButton.addEventListener('click', () => {
    onNavigate('start')
  })

  const guideButton = document.createElement('button')
  guideButton.type = 'button'
  guideButton.textContent = '新手引导'
  guideButton.addEventListener('click', () => {
    onNavigate('guide')
    showGuide()
  })

  const exitButton = document.createElement('button')
  exitButton.type = 'button'
  exitButton.textContent = '退出游戏'
  exitButton.addEventListener('click', () => {
    onNavigate('exit')
    showExitConfirm()
  })

  buttonGroup.append(startButton, guideButton, exitButton)

  const versionLabel = document.createElement('div')
  versionLabel.className = 'home-version'
  versionLabel.textContent = '版本号：v0.1'

  const guideModal = document.createElement('div')
  guideModal.className = 'guide-modal'
  guideModal.setAttribute('aria-hidden', 'true')

  const guideContent = document.createElement('div')
  guideContent.className = 'guide-content'

  const guideBody = document.createElement('div')
  guideBody.className = 'guide-body'
  guideBody.textContent =
    '① 游戏简介\n' +
    '欢迎来到 Emperor–Slave Game \n' +
    '这是一款基于心理博弈的卡牌游戏。你需要在有限的信息下，选择合适的卡牌，与系统进行对抗。\n\n' +
    '② 卡牌介绍：\n' +
    '皇帝（Emperor）：地位最高的卡牌，可以战胜平民，但会被奴隶击败。\n' +
    '平民（Citizen）：最普通的卡牌，与其他平民对战时平局，可以击败奴隶，被皇帝击败。\n' +
    '奴隶（Slave）：地位最低，但拥有特殊能力，可以击败皇帝，但会被平民击败。\n\n' +
    '③ 胜负规则\n' +
    '胜负关系如下：\n' +
    '皇帝 > 平民\n' +
    '奴隶 > 皇帝\n' +
    '平民 > 奴隶\n\n' +
    '④ 游戏流程\n' +
    '选择一张卡牌 > 再次点击出牌 > 系统同时出牌并判定胜负 > 查看结果，进入下一回合或结束游戏。\n\n' +
    '⑤ 提示\n' +
    '系统不会固定出牌模式。观察结果、调整策略，才是获胜的关键。\n\n' +
    '准备好了吗？\n' +
    '点击「开始游戏」进入第一局。'

  const guideClose = document.createElement('button')
  guideClose.type = 'button'
  guideClose.className = 'guide-close'
  guideClose.textContent = '我知道了'
  guideClose.addEventListener('click', () => {
    hideGuide()
  })

  guideContent.append(guideBody)
  guideModal.append(guideContent, guideClose)

  const exitModal = document.createElement('div')
  exitModal.className = 'exit-modal'
  exitModal.setAttribute('aria-hidden', 'true')

  const exitDialog = document.createElement('div')
  exitDialog.className = 'exit-dialog'

  const exitTitle = document.createElement('div')
  exitTitle.className = 'exit-title'
  exitTitle.textContent = '确定退出游戏吗？'

  const exitActions = document.createElement('div')
  exitActions.className = 'exit-actions'

  const exitCancel = document.createElement('button')
  exitCancel.type = 'button'
  exitCancel.className = 'exit-button'
  exitCancel.textContent = '返回游戏'
  exitCancel.addEventListener('click', () => {
    hideExitConfirm()
  })

  const exitConfirm = document.createElement('button')
  exitConfirm.type = 'button'
  exitConfirm.className = 'exit-button'
  exitConfirm.textContent = '退出游戏'
  exitConfirm.addEventListener('click', () => {
    alert('exit game')
  })

  exitActions.append(exitCancel, exitConfirm)
  exitDialog.append(exitTitle, exitActions)
  exitModal.appendChild(exitDialog)

  container.append(title, buttonGroup, versionLabel, guideModal, exitModal)

  function showGuide(): void {
    guideModal.classList.add('is-visible')
    guideModal.setAttribute('aria-hidden', 'false')
  }

  function hideGuide(): void {
    guideModal.classList.remove('is-visible')
    guideModal.setAttribute('aria-hidden', 'true')
  }

  function showExitConfirm(): void {
    exitModal.classList.add('is-visible')
    exitModal.setAttribute('aria-hidden', 'false')
  }

  function hideExitConfirm(): void {
    exitModal.classList.remove('is-visible')
    exitModal.setAttribute('aria-hidden', 'true')
  }
}
