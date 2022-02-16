import {ethers} from 'ethers'
import './style.css'

const widgetUrl = 'https://uni-widget-iframe.vercel.app'
const iframe: any = document.getElementById('iframe')

// ensure that you have MetaMask installed.
const provider = new ethers.providers.Web3Provider((window as any).ethereum)

const reloadWidget = () => {
    iframe.contentWindow?.postMessage({
        target: 'swapWidget',
        method: 'reload',
    }, widgetUrl)
}

provider.send('eth_requestAccounts', []).then(() => {
    iframe.addEventListener('load', _ => {
        iframe.contentWindow.postMessage({
                target: 'swapWidget',
                method: 'setConfig',
                payload: {
                    jsonRpcEndpoint: 'https://polygon-rpc.com/',
                    tokenList: 'https://tokens.uniswap.org/',
                },
            },
            widgetUrl
        )
    })

    window.addEventListener('message', (e) => {
        if (e.origin !== widgetUrl || !e.data.jsonrpc || !provider.getSigner()) return

        const request = e.data.method

        provider.send(request?.method, request?.params || []).then((result) => {
            iframe.contentWindow!.postMessage({
                    jsonrpc: e.data.jsonrpc,
                    id: e.data.id,
                    result,
                },
                widgetUrl
            )
        })
    });

    (provider.provider as any).on('accountsChanged', () => reloadWidget());
    (provider.provider as any).on('networkChanged', () => reloadWidget())

    iframe.setAttribute('src', widgetUrl)
})
