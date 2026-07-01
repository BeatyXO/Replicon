import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'
import { GENLAYER_RPC_URL } from '@/lib/constants'
import { getProvider } from '@/lib/wallet/provider'

export function getGenLayerClient(signerAddress?: `0x${string}`) {
  const provider = getProvider()
  return createClient({
    chain: studionet,
    endpoint: GENLAYER_RPC_URL,
    ...(provider ? { provider } : {}),
    ...(signerAddress ? { account: signerAddress } : {}),
  })
}

export function resetClient() {}
