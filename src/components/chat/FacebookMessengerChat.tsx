"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

declare global {
  interface Window {
    FB?: any;
  }
}

type Props = {
  pageId: string;
  locale?: string; // en_US, fr_FR, etc.
};

// Most basic Messenger Customer Chat integration per Facebook docs
export function FacebookMessengerChat({ pageId, locale = "en_US" }: Props) {
  const [fallback, setFallback] = useState(false);

  // If the SDK doesn’t load (blocked/mime mismatch), show a simple link fallback
  useEffect(() => {
    const t = setTimeout(() => {
      const sdkOk = !!window.FB;
      const containerOk = !!document.querySelector('.fb-customerchat');
      if (!sdkOk || !containerOk) setFallback(true);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Required root */}
      <div id="fb-root" />
      {/* Chat container */}
      <div id="fb-customer-chat" className="fb-customerchat" />

      {/* Set required attributes on the chat container */}
      <Script
        id="fb-chat-attrs"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var chatbox = document.getElementById('fb-customer-chat');
              if (!chatbox) return;
              chatbox.setAttribute('page_id', '${pageId}');
              chatbox.setAttribute('attribution', 'biz_inbox');
            })();
          `,
        }}
      />

      {/* Initialize the SDK */}
      <Script
        id="fb-sdk-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              FB.init({
                xfbml: true,
                version: 'v21.0'
              });
            };

            (function(d, s, id) {
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = 'https://connect.facebook.net/${locale}/sdk/xfbml.customerchat.js';
              js.type = 'text/javascript';
              js.onerror = function(){
                try {
                  console.warn('[MessengerChat] Failed to load SDK for locale ${locale}. Falling back to en_US');
                  var fb = document.getElementById('facebook-jssdk-fallback');
                  if (!fb) {
                    fb = d.createElement(s); fb.id = 'facebook-jssdk-fallback';
                    fb.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
                    fb.type = 'text/javascript';
                    fjs.parentNode.insertBefore(fb, fjs);
                  }
                } catch (e) {
                  console.error('[MessengerChat] Fallback injection error', e);
                }
              };
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

            // Lightweight diagnostics to help during setup
            setTimeout(function(){
              var present = !!document.querySelector('.fb-customerchat');
              if (!present) {
                console.warn('[MessengerChat] .fb-customerchat container not found');
              }
              if (!window.FB) {
                console.warn('[MessengerChat] FB SDK not loaded. Check network/adblock and domain whitelist.');
              }
            }, 2000);
          `,
        }}
      />
      {/* Optional: floating debug icon */}
      {process.env.NEXT_PUBLIC_CHAT_DEBUG === "true" ? <ChatDebugButton pageId={pageId} /> : null}

      {/* Graceful fallback: open Messenger thread in new tab when SDK is blocked */}
      {fallback && (
        <a
          href={`https://m.me/${pageId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed z-[9999] bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg px-4 py-3 flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Chat</span>
        </a>
      )}
    </>
  );
}


function ChatDebugButton({ pageId }: { pageId: string }) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [containerPresent, setContainerPresent] = useState(false);

  const poll = useCallback(() => {
    setSdkLoaded(!!window.FB);
    setContainerPresent(!!document.querySelector('#fb-customer-chat.fb-customerchat'));
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, [poll]);

  const ensureLoad = useCallback(() => {
    try {
      let container = document.getElementById('fb-customer-chat');
      if (!container) {
        container = document.createElement('div');
        container.id = 'fb-customer-chat';
        container.className = 'fb-customerchat';
        document.body.appendChild(container);
      }
      container.setAttribute('page_id', pageId);
      container.setAttribute('attribution', 'biz_inbox');

      // Load SDK if missing
      if (!document.getElementById('facebook-jssdk')) {
        const js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
        const fjs = document.getElementsByTagName('script')[0];
        fjs?.parentNode?.insertBefore(js, fjs);
      }

      if (window.FB?.XFBML?.parse) {
        window.FB.XFBML.parse();
        console.info('[MessengerChat] Re-parsed XFBML');
      }
    } catch (e) {
      console.error('[MessengerChat] ensureLoad error', e);
    }
  }, [pageId]);

  const color = sdkLoaded && containerPresent ? 'bg-green-600' : 'bg-red-600';
  const title = `FB SDK: ${sdkLoaded ? 'loaded' : 'missing'} | Container: ${containerPresent ? 'present' : 'missing'}`;

  return (
    <button
      type="button"
      onClick={ensureLoad}
      title={title}
      className={`fixed z-[10000] bottom-24 right-4 ${color} text-white shadow-lg rounded-full p-3 flex items-center gap-2`}
      style={{
        // Nudge left if the Messenger bubble appears to avoid overlap
        transform: 'translateX(0)'
      }}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-xs font-medium hidden sm:inline">Chat debug</span>
    </button>
  );
}
