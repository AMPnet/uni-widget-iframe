import './App.css'
import {useCallback, useEffect, useState} from 'react'
import {SwapWidget} from '@uniswap/widgets'
import {IFrameEthereumProvider} from '@ethvault/iframe-provider'
import {Provider} from '@web3-react/types'
import {TokenInfo} from '@uniswap/token-lists'
import {providers, Signer} from 'ethers'

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

    // TODO: uncomment when error on widget side is resolved
    // Swap failed Error: invalid object key - gas (argument="transaction:gas", value={"gas":"0x26bbe","value":"0xdbf4a8777c6c248","from":"0x9a72ad187229e9338c7f21e019544947fb25d473","to":"0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45","data":"0x5ae401dc000000000000000000000000000000000000000000000000000000006213917500000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000007ceb23fd6bc0add59e62ac25578270cff1b9f6190000000000000000000000000000000000000000000000000000000000000bb80000000000000000000000009a72ad187229e9338c7f21e019544947fb25d4730000000000000000000000000000000000000000000000000dbf4a8777c6c2480000000000000000000000000000000000000000000000000001ff23625df5c3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"}, code=INVALID_ARGUMENT, version=properties/5.5.0)
    //
    // const signer = new providers.Web3Provider(iframeProvider).getSigner()
    // const provider = new providers.StaticJsonRpcProvider(widgetConfig.jsonRpcEndpoint!)
    //
    // const widgetProvider = {
    //     signer: signer,
    //     provider: provider
    // }
    const widgetProvider = iframeProvider

    return (
        <SwapWidget
            theme={widgetConfig.theme}
            locale={widgetConfig.locale}
            provider={widgetProvider}
            width={widgetConfig.width}
            dialog={widgetConfig.dialog}
            className={widgetConfig.className}
            onError={(error, info) => window.parent.postMessage(outputMessage('onError', {error, info}), '*')}

            tokenList={widgetConfig.tokenList}
            defaultInputAddress={widgetConfig.defaultInputAddress}
            defaultInputAmount={widgetConfig.defaultInputAmount}
            defaultOutputAddress={widgetConfig.defaultOutputAddress}
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

// Widget specific types

type SwapWidgetProps = SwapProps & WidgetProps

interface SwapProps {
    tokenList?: string | TokenInfo[];
    defaultInputAddress?: DefaultAddress;
    defaultInputAmount?: string;
    defaultOutputAddress?: DefaultAddress;
    defaultOutputAmount?: string;
    convenienceFee?: number;
    convenienceFeeRecipient?: string | {
        [chainId: number]: string;
    };
    onConnectWallet?: () => void;
}

type DefaultAddress = string | {
    [chainId: number]: string | 'NATIVE';
} | 'NATIVE';

interface WidgetProps {
    theme?: Theme;
    locale?: string;
    provider?: Provider | providers.Provider | ProviderWithSigner;
    jsonRpcEndpoint?: string;
    width?: string | number;
    dialog?: HTMLElement | null;
    className?: string;
    onError?: (error: any, info: any) => void;
}

interface ProviderWithSigner {
    provider: providers.Provider;
    signer: Signer;
}

interface Theme extends Partial<Attributes>, Partial<Colors> {
}

interface Attributes {
    borderRadius: boolean | number;
    fontFamily: string;
    fontFamilyVariable: string;
    fontFamilyCode: string;
    tokenColorExtraction: boolean;
}

interface Colors {
    accent: string;
    container: string;
    module: string;
    interactive: string;
    outline: string;
    dialog: string;
    primary: string;
    onAccent: string;
    secondary: string;
    hint: string;
    onInteractive: string;
    active: string;
    success: string;
    warning: string;
    error: string;
    currentColor: 'currentColor';
}

export default App
