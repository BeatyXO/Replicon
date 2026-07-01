/* Injected wallet provider utilities */

export const GENLAYER_CHAIN_ID = '0xf22f' // 61999 decimal — GenLayer StudioNet
export const GENLAYER_CHAIN_ID_DEC = 61999

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void
}

interface WindowWithEthereum extends Window {
  ethereum?: EthereumProvider
}

export function getProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  return (window as WindowWithEthereum).ethereum ?? null
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getProvider()
  if (!provider) throw new Error('No injected wallet found. Please install MetaMask or a compatible wallet.')
  const accounts = await provider.request({ method: 'eth_requestAccounts' })
  return accounts as string[]
}

export async function getAccounts(): Promise<string[]> {
  const provider = getProvider()
  if (!provider) return []
  try {
    const accounts = await provider.request({ method: 'eth_accounts' })
    return accounts as string[]
  } catch {
    return []
  }
}

export async function getCurrentChainId(): Promise<string> {
  const provider = getProvider()
  if (!provider) return ''
  try {
    const chainId = await provider.request({ method: 'eth_chainId' })
    return chainId as string
  } catch {
    return ''
  }
}

export async function switchToGenLayerNetwork(): Promise<void> {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet found')

  const currentChain = await getCurrentChainId()
  if (currentChain.toLowerCase() === GENLAYER_CHAIN_ID.toLowerCase()) return

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: GENLAYER_CHAIN_ID }],
    })
  } catch (switchError: unknown) {
    // Chain not added yet — add it
    const err = switchError as { code?: number }
    if (err?.code === 4902 || err?.code === -32603) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: GENLAYER_CHAIN_ID,
            chainName: 'GenLayer StudioNet',
            nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
            rpcUrls: ['https://studio.genlayer.com/api'],
            blockExplorerUrls: ['https://studio.genlayer.com'],
          },
        ],
      })
    } else {
      throw switchError
    }
  }
}

export function onAccountsChanged(cb: (accounts: string[]) => void): () => void {
  const provider = getProvider()
  if (!provider) return () => {}
  provider.on('accountsChanged', (...args: unknown[]) => cb(args[0] as string[]))
  return () => provider.removeListener('accountsChanged', (...args: unknown[]) => cb(args[0] as string[]))
}

export function onChainChanged(cb: (chainId: string) => void): () => void {
  const provider = getProvider()
  if (!provider) return () => {}
  provider.on('chainChanged', (...args: unknown[]) => cb(args[0] as string))
  return () => provider.removeListener('chainChanged', (...args: unknown[]) => cb(args[0] as string))
}
