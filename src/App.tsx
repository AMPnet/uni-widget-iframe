import './App.css'
import {useCallback, useEffect, useState} from 'react'
import {SwapWidget} from '@uniswap/widgets'
import {IFrameEthereumProvider} from '@ethvault/iframe-provider'
import {Provider} from '@web3-react/types'
import {TokenInfo} from '@uniswap/token-lists'

function App() {
    const [widgetConfig, setWidgetConfig] = useState({} as Partial<SwapWidgetProps>)

    const configUpdate = useCallback(event => {
        const type = event.data.type
        if (type === 'widgetReload') {
            window.location.reload()
        } else if (type === 'widgetConfig') {
            if (event.data.config) setWidgetConfig(() => event.data.config)
        }
    }, [])

    useEffect(() => {
        window.addEventListener('message', configUpdate)
        return () => {
            window.removeEventListener('message', configUpdate)
        }
    }, [configUpdate])

    if (window === window.parent || !widgetConfig.jsonRpcEndpoint) return <></>

    let provider = new IFrameEthereumProvider();
    (provider as any).request = provider.send

    return (
        <SwapWidget
            theme={widgetConfig.theme}
            locale={widgetConfig.locale}
            provider={provider as any}
            jsonRpcEndpoint={widgetConfig.jsonRpcEndpoint}
            width={widgetConfig.width}
            dialog={widgetConfig.dialog}
            className={widgetConfig.className}
            onError={undefined}

            tokenList={widgetConfig.tokenList}
            defaultInputAddress={widgetConfig.defaultInputAddress}
            defaultInputAmount={widgetConfig.defaultInputAmount}
            defaultOutputAddress={widgetConfig.defaultOutputAddress}
            defaultOutputAmount={widgetConfig.defaultOutputAmount}
            convenienceFee={widgetConfig.convenienceFee}
            convenienceFeeRecipient={widgetConfig.convenienceFeeRecipient}
            onConnectWallet={undefined}
        />
    )
}

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
    provider?: Provider;
    jsonRpcEndpoint?: string;
    width?: string | number;
    dialog?: HTMLElement | null;
    className?: string;
    onError?: (error: any, info: any) => void;
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
