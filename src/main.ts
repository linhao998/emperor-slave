import './style.css'
import { createApp } from './app/createApp'
import { renderHome } from './app/screens/HomeScreen'
import { renderGame } from './app/screens/GameScreen'

const host = document.querySelector<HTMLDivElement>('#app')

if (!host) {
  throw new Error('App host element not found')
}

const root = createApp()
host.appendChild(root)

const stageWidth = 1440
const stageHeight = 800

const getViewportSize = (): { width: number; height: number } => {
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height,
    }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

const applyStageScale = (): void => {
  const { width, height } = getViewportSize()
  const scale = Math.min(width / stageWidth, height / stageHeight)
  const scaledWidth = stageWidth * scale
  const scaledHeight = stageHeight * scale
  const offsetLeft = (width - scaledWidth) / 2
  const offsetTop = (height - scaledHeight) / 2
  root.style.setProperty('--stage-scale', `${scale}`)
  root.style.left = `${offsetLeft}px`
  root.style.top = `${offsetTop}px`
}

window.addEventListener('resize', applyStageScale)

const showHome = (): void => {
  document.body.classList.remove('is-game-active')
  renderHome(root, (target) => {
    if (target === 'start') {
      showGame()
    }
  })
}

const showGame = (): void => {
  document.body.classList.add('is-game-active')
  renderGame(root, {
    onExitToHome: () => {
      showHome()
    },
  })
}

showHome()
applyStageScale()
