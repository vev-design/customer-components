import React, { useEffect, useRef } from "react";
import styles from "./VideoPlayerBS.module.css";
import { registerVevComponent, useDevice } from "@vev/react";

type Props = {
  videoIdMobile: number;
  videoIdDesktop: number;
  repeat: boolean;
  theme: boolean;
  autoplay: boolean;
};

declare global {
  interface Window { SVP: any; }
}

const VideoPlayerBS = ({ videoIdMobile = 173843, videoIdDesktop = 173843, repeat = false, theme = true, autoplay = true }: Props) => {
  const device = useDevice() as 'desktop' | 'tablet' | 'mobile';
  const playerRef = useRef<HTMLDivElement>(null);

  // Detect Browsers:
  let userAgentString = navigator.userAgent;
  let safariAgent = userAgentString.indexOf("Safari") > -1;
  let chromeAgent = userAgentString.indexOf("Chrome") > -1;
  let iosAgent = (userAgentString.indexOf("iPhone") > -1 || userAgentString.indexOf("iPad") > -1);
  if (chromeAgent && safariAgent) {
    safariAgent = false;
  }

  const enableMutedAutoplay = autoplay && theme;

  console.log("enableMutedAutoplay: ", enableMutedAutoplay);

  const plugins = (enableMutedAutoplay) ? {
    'https://vgc.no/player/player-plugin-muted-latest.js': {
      name: 'MutedPlugin',
      options: {
      }
    }
  } : {};

  const autoPlay = autoplay ? 'viewable' : false;

  console.log("autoplay: " + autoPlay);


  const playerInit = () => {
    const provider = returnProvider();
    const player = new window.SVP.Player({
      id: (device === 'desktop' && !safariAgent && !iosAgent) ? videoIdDesktop : videoIdMobile,
      vendor: 'brandstudio',
      node: playerRef.current.id,
      autoplay: autoPlay,
      autopause: 'viewable',
      stretching: 'fill',
      recommended: { autoplay: false, next: false, grid: false },
      mute: enableMutedAutoplay,
      locale: "no",
      skin: { name: "vgtv", url: "https://vgc.no/player/player-skin-vgtv-latest.css" },
      pulse: {
        provider: provider,
        // optional, do not supply this function if you don't modify base pulse data
        // this function has to always return object with correct pulse schema
        decorator: (eventData, asset) => {
          // modify or add some data to pulse event before it is sent
          // asset is currently used stream in entity

          return { ...eventData, provider: { ...eventData.provider, productTag: 'partnerstudio' }, object: { ...eventData.object, loop: repeat, autoplay: true } };
        }
      },
      plugins: plugins
    });

    if (repeat) {
      player.on('time', () => {
        if (player.getDuration() - player.getCurrentTime() <= .5) {
          player.seek(0);
        }
      });
    }

    return player;
  }


  const runPlayer = () => {
    if (!window.SVP || !window.SVP.isLoaded) {
      console.debug("Adding event listener for onSvpPlayerReady event.");
      window.addEventListener('onSvpPlayerReady', playerInit);
    } else {
      console.debug(videoIdDesktop + " Calling initPlayer.");
      playerInit();
    }
  }

  const returnProvider = (): string => {
    if (window.location.hostname) {
      if (window.location.hostname.includes('adressa.no')) {
        return 'adressano';
      } else if (window.location.hostname.includes('aftenposten.no')) {
        return 'aftenposten';
      } else if (window.location.hostname.includes('bt.no')) {
        return 'bt';
      } else if (window.location.hostname.includes('e24.no')) {
        return 'e24';
      } else if (window.location.hostname.includes('fvn.no')) {
        return 'faedrelandsvennen';
      } else if (window.location.hostname.includes('aftenbladet.no')) {
        return 'stavangeraftenblad';
      } else if (window.location.hostname.includes('vg.no')) {
        return 'vg';
      } else if (window.location.hostname.includes('tek.no')) {
        return 'tekno';
      } else if (window.location.hostname.includes('finn.no')) {
        return 'finn';
      } else if (window.location.hostname.includes('godt.no')) {
        return 'godt';
      } else if (window.location.hostname.includes('minmote.no')) {
        return 'minmote';
      } else {
        return 'PULSE-INIT';
      }
    } else {
      return 'PULSE-INIT'
    }
  }

  const initPlayer = (d, s, id) => {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      console.log(videoIdDesktop + " NOT adding script.");
      return;
    }
    js = d.createElement(s);
    js.id = id;
    // for production it's required to use latest release if possible
    //js.src = 'https://cdn.stream.schibsted.media/player/3.17.0/player.min.js';

    //    js.src = 'https://vgc.no/player/player.min-latest.js'; //This should always be the latest version (still the base SVP player)
    js.src = 'https://vgc.no/player/player.next.min.bundled-latest.js'; //This should always be the latest version (still the base SVP player)

    js.async = true;
    /*try {
      eval('async () => {}'), (js.src = js.src.replace('player.min', 'player.next.min'));
    } catch (a) { } */
    console.log(videoIdDesktop + " INSERTing script.");
    fjs.parentNode.insertBefore(js, fjs);
  };

  useEffect(() => {
    //Init player
    initPlayer(document, 'script', 'svp-player-sdk');
    runPlayer();
  }, [device]);

  return (
    <div className={styles.embedContainer}>
      <div id={`${videoIdDesktop}${videoIdMobile}-player`} ref={playerRef}></div>
    </div>
  );
};

registerVevComponent(VideoPlayerBS, {
  name: "Schibsted Video Player BS",
  props: [
    { name: "videoIdMobile", title:"Id til video for mobil", type: "number", initialValue: 173843 },
    { name: "videoIdDesktop", title:"Id til video for mobil", type: "number", initialValue: 173734 },
    { name: "repeat", title:"Repeat playback", type: "boolean", initialValue: false },
    { name: "theme", title:"Enable VG theme (Mute button)", type: "boolean", initialValue: true },
    { name: "autoplay", title:"Autoplay", type: "boolean", initialValue: true },
  ],
  editableCSS: [
    {
      selector: styles.embedContainer,
      properties: ["background", "border-radius", "outline"],
    },
  ],
  type: 'both',
});

export default VideoPlayerBS;
