import './App.css'
import {useCallback, useEffect, useState} from 'react'
import {SwapWidget, SwapWidgetProps} from '@uniswap/widgets'
import {IFrameEthereumProvider} from '@ethvault/iframe-provider'
import {providers} from 'ethers'

function App() {
    const [widgetConfig, setWidgetConfig] = useState({} as Partial<SwapWidgetProps>)

    const eventHandler = useCallback(event => {
        const data = event.data as WidgetEventMessageInputData
        if (data.target !== 'swapWidget') return

        switch (data.method) {
            case 'setConfig':
                return setWidgetConfig(() => data.payload)
            case 'reload':
                return window.location.reload()
        }
    }, [])

    useEffect(() => {
        window.addEventListener('message', eventHandler)
        return () => {
            window.removeEventListener('message', eventHandler)
        }
    }, [eventHandler])

    const isInIframe: boolean = window !== window.parent
    const isInitialized: boolean = !!widgetConfig.jsonRpcEndpoint

    if (!isInIframe || !isInitialized) return <></>

    const iframeProvider = new IFrameEthereumProvider() as any
    iframeProvider.request = iframeProvider.send

    const signer = new providers.Web3Provider(iframeProvider).getSigner()
    const provider = (typeof widgetConfig.jsonRpcEndpoint === 'string') ?
        new providers.StaticJsonRpcProvider(widgetConfig.jsonRpcEndpoint! as string) :
        widgetConfig.jsonRpcEndpoint

    return (
        <SwapWidget
            theme={widgetConfig.theme}
            locale={widgetConfig.locale}
            provider={signer.provider}
            jsonRpcEndpoint={provider}
            width={widgetConfig.width}
            dialog={widgetConfig.dialog}
            className={widgetConfig.className}
            onError={(error, info) => window.parent.postMessage(outputMessage('onError', {error, info}), '*')}

            tokenList={widgetConfig.tokenList}
            defaultInputTokenAddress={widgetConfig.defaultInputTokenAddress}
            defaultInputAmount={widgetConfig.defaultInputAmount}
            defaultOutputTokenAddress={widgetConfig.defaultInputTokenAddress}
            defaultOutputAmount={widgetConfig.defaultOutputAmount}
            convenienceFee={widgetConfig.convenienceFee}
            convenienceFeeRecipient={widgetConfig.convenienceFeeRecipient}
            onConnectWallet={() => window.parent.postMessage(outputMessage('onConnectWallet'), '*')}
        />
    )
}

function outputMessage(method: WidgetOutputMethod, payload?: any): WidgetEventMessageOutputData {
    return {
        target: 'swapWidget',
        method,
        payload,
    }
}

interface WidgetEventMessageInputData {
    target: 'swapWidget'
    method: WidgetInputMethod
    payload?: any
}

interface WidgetEventMessageOutputData {
    target: 'swapWidget'
    method: WidgetOutputMethod
    payload?: any
}

type WidgetInputMethod = 'reload' | 'setConfig'
type WidgetOutputMethod = 'onConnectWallet' | 'onError'

export default App
