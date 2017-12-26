import * as React from 'react';

/**
 * The YT.ListType provided by the community looks to have a typo in the "playlist" value.
 * Accodring to the docs (https://developers.google.com/youtube/player_parameters?hl=pl#listtype)
 * the correct value is "playlist" not "player" * 
 */
export enum ListType {
  search = 'search',
  userUploads = 'user_uploads',
  playlist = 'playlist'
}

export type RenderFunction = {
  (params: {
    iframe: JSX.Element,

    loadVideoById: Function,
    cueVideoByUrl: Function,
    loadVideoByUrl: Function,
    loadPlaylist: Function,
    cuePlaylist: Function,

    pauseVideo: Function,
    playVideo: Function,
    mute: Function,
    unMute: Function,
    isMuted: Function,
    setVolume: Function,
    getVolume: Function,

    stopVideo: Function,
    clearVideo: Function,

    nextVideo: Function,
    previousVideo: Function,
    playVideoAt: Function,  
    
    seekTo: Function,

    getPlaybackRate: Function,
    setPlaybackRate: Function,

    getAvailablePlaybackRates: Function,

    setLoop: Function,
    setShuffle: Function,

    getPlayerState: Function,
    getCurrentTime: Function,

    getPlaybackQuality: Function,
    setPlaybackQuality: Function,

    getVideoLoadedFraction: Function,
    getDuration: Function,
    getVideoUrl: Function,
    getVideoEmbedCode: Function,

    getPlaylist: GetPlaylistFunction,
    getPlaylistIndex: Function,

    addEventListener: Function,
    removeEventListener: Function,

    player: YT.Player

  }): React.ReactNode;
};

type GetPlaylistFunction = {
  (): Array<string>;
};

export type YoutubeProps = {
  autoplay?: YT.AutoPlay;
  ccLoadPolicy?: YT.ClosedCaptionsLoadPolicy;
  color?: YT.ProgressBarColor;
  controls?: YT.Controls;
  disablekb?: YT.KeyboardControls;
  enableJsApi?: YT.JsApi;
  end?: number;
  fs?: YT.FullscreenButton;
  hl?: string;
  ivLoadPolicy?: YT.IvLoadPolicy;
  list?: string;
  listType?: ListType;
  loop?: YT.Loop;
  modestbranding?: YT.ModestBranding;
  origin?: string;
  playlist?: string;
  playsinline?: YT.PlaysInline;
  rel?: YT.RelatedVideos;
  showinfo?: YT.ShowInfo;
  start?: number;
  videoId?: string;

  render?: RenderFunction;

  events?: {
    onReady?: YT.PlayerEventHandler<YT.PlayerEvent>;
    onStateChange?: YT.PlayerEventHandler<YT.OnStateChangeEvent>;
    onPlaybackQualityChange?: YT.PlayerEventHandler<YT.OnPlaybackQualityChangeEvent>;
    onPlaybackRateChange?: YT.PlayerEventHandler<YT.OnPlaybackRateChangeEvent>;
    onError?: YT.PlayerEventHandler<YT.OnErrorEvent>;
    onApiChange?: YT.PlayerEventHandler<YT.PlayerEvent>;
  };
};

type YoutubeState = {
  playerName: string;

  isMuted: boolean;
  volume: number;
  availablePlaybackRates: Array<number>;
  playbackRate: number;
  playbackQuality: string;
  currentTime: number;
  duration: number;
  videoUrl: string;
  videoEmbedCode: string;
  playerState: number;
  playlist: Array<string>;
  playlistIndex: number;
  videoLoadedFraction: number;
};

export default class YoutubePlayer extends React.Component<YoutubeProps, YoutubeState> {

  static loadPromise: Promise<boolean>;

  state: YoutubeState = {
    playerName: `youtube_player_${Math.random()}`,

    isMuted: false,
    volume: 100,
    availablePlaybackRates: [],
    playbackRate: 1,
    playbackQuality: 'large',
    currentTime: 0,
    duration: 0,
    videoUrl: '',
    videoEmbedCode: '',
    playerState: -1,
    playlist: [],
    playlistIndex: 0,
    videoLoadedFraction: 0,
  };

  player: YT.Player;  
  syncInterval: number;

  callbackObject = {
    iframe: <div id={this.state.playerName} />,

    loadVideoById: (videoId: string, start: number, quality: string) => {
      this.proxyToPlayer('loadVideoById', [videoId, start, quality]);
    },
    cueVideoByUrl: (videoId: string, start: number, quality: string) => {
      this.proxyToPlayer('loadVideoById', [videoId, start, quality]);
    },
    loadVideoByUrl: (videoUrl: string, start: number, quality: string) => {
      this.proxyToPlayer('videoUrl', [videoUrl, start, quality]);
    },

    loadPlaylist: (
      playlistIdOrItems: string | Array<string>, 
      index: number, 
      start: number, 
      quality: string
    ) => {
      if (typeof playlistIdOrItems === 'string') {
        this.proxyToPlayer('loadPlaylist', [{
          list: playlistIdOrItems, 
          listType: ListType.playlist,
          index: index.toString(), 
          startSeconds: start || 0, 
          suggestedQuality: quality
        }]);
      } else {
        this.proxyToPlayer('loadPlaylist', [playlistIdOrItems, index, start, quality]);
      }
    },
    cuePlaylist: (playlistId: string | Array<string>, index: number, start: number, quality: string) => {
      this.proxyToPlayer('cuePlaylist', [playlistId, index, start, quality]);
    },

    pauseVideo: () => this.proxyToPlayer('pauseVideo'),
    playVideo: () => this.proxyToPlayer('playVideo'),
    stopVideo: () => this.proxyToPlayer('stopVideo'),
    clearVideo: () => this.proxyToPlayer('clearVideo'),

    nextVideo: () => this.proxyToPlayer('nextVideo'),
    previousVideo: () => this.proxyToPlayer('previousVideo'),
    playVideoAt: (index: number) => this.proxyToPlayer('playVideoAt', [index]),

    seekTo: (seekTo: number, allowSeek: boolean) => this.proxyToPlayer('seekTo', [seekTo, allowSeek]),

    mute: () => {
      this.proxyToPlayer('mute');
      this.setState({ isMuted: true });
    },
    unMute: () => {
      this.proxyToPlayer('unMute');
      this.setState({ isMuted: false });
    },
    isMuted: () => this.state.isMuted,
    setVolume: (volume: number) => {
      this.proxyToPlayer('setVolume', [volume]);
      this.setState({
        volume: 50
      });
    },
    getVolume: () => this.state.volume,

    getPlaybackRate: () => this.state.playbackRate,
    setPlaybackRate: (rate: number) => {
      if (this.player.getAvailablePlaybackRates().indexOf(rate) !== -1) {
        this.proxyToPlayer('setPlaybackRate', [rate]);
        this.setState({ playbackRate: rate });        
      }
    },
    getAvailablePlaybackRates: () => this.state.availablePlaybackRates,

    setLoop: (loop: boolean) => this.proxyToPlayer('setLoop', [loop]),
    setShuffle: (shuffle: boolean) => this.proxyToPlayer('setShuffle', [shuffle]),

    getVideoLoadedFraction: () => this.state.videoLoadedFraction,

    getPlayerState: () => this.state.playerState,
    getCurrentTime: () => this.state.currentTime,

    getPlaybackQuality: () => this.state.playbackQuality,
    setPlaybackQuality: (quality: string) => {
      this.proxyToPlayer('setPlaybackQuality', [quality]);
      this.setState({ playbackQuality: quality });         
    },

    getDuration: () => this.state.duration,
    getVideoUrl: () => this.state.videoUrl,
    getVideoEmbedCode: () => this.state.videoEmbedCode,

    getPlaylist: () => {
      if (this.props.listType === ListType.playlist && Array.isArray(this.props.listType)) {          
        return this.props.listType;          
      } else if (Array.isArray(this.state.playlist) && this.state.playlist.length !== 0) {
        return this.state.playlist;
      }
      return [];
    },
    getPlaylistIndex: () => this.state.playlistIndex,

    addEventListener: (event: string, listener: Function) => this.proxyToPlayer('addEventListener', [listener]),
    removeEventListener: (event: string, listener: Function) => this.proxyToPlayer('removeEventListener', [listener]),

    player: this.player
  };

  getPlayerVars(): {[s: string]: number | string | Array<string>} {
    const playerVars: {[s: string]: number | string | Array<string>} = {};

    if (this.props.autoplay !== undefined) {
      playerVars.autoplay = (this.props.autoplay ? '1' : '0');
    }

    if (this.props.ccLoadPolicy !== undefined) {
      playerVars.cc_load_policy = (this.props.autoplay ? '1' : '0');
    } 

    if (this.props.color !== undefined) {
      playerVars.color = this.props.color;
    } 

    if (this.props.controls !== undefined) {
      playerVars.controls = this.props.controls;
    }

    if (this.props.disablekb !== undefined) {
      playerVars.disablekb = (this.props.disablekb ? '1' : '0');
    }

    if (this.props.enableJsApi !== undefined) {
      playerVars.enablejsapi = (this.props.enableJsApi ? '1' : '0');
    }

    if (this.props.end !== undefined) {
      playerVars.end = this.props.end;
    }

    if (this.props.fs !== undefined) {
      playerVars.fs = this.props.fs ? '1' : '0';
    }

    if (this.props.hl !== undefined) {
      playerVars.hl = this.props.hl;
    }

    if (this.props.ivLoadPolicy !== undefined) {
      playerVars.iv_load_policy = this.props.ivLoadPolicy;
    }

    if (this.props.list !== undefined) {
      playerVars.list = this.props.list;
    }

    if (this.props.listType !== undefined) {
      playerVars.listType = this.props.listType;
    }

    if (this.props.loop !== undefined) {
      playerVars.loop = (this.props.loop ? '1' : '0');
    }

    if (this.props.modestbranding !== undefined) {
      playerVars.modestbranding = (this.props.modestbranding ? '1' : '0');
    }

    if (this.props.origin !== undefined) {
      playerVars.origin = this.props.origin;
    }

    if (this.props.playlist !== undefined) {
      playerVars.playlist = (this.props.playlist ? '1' : '0');
    }

    if (this.props.playsinline !== undefined) {
      playerVars.playsinline = (this.props.playsinline ? '1' : '0');
    }

    if (this.props.rel !== undefined) {
      playerVars.rel = (this.props.rel ? '1' : '0');
    }

    if (this.props.showinfo !== undefined) {
      playerVars.showinfo = (this.props.showinfo ? '1' : '0');
    }

    if (this.props.start !== undefined) {
      playerVars.start = this.props.start;
    } 
    
    return playerVars;
  }

  proxyToPlayer = (
    functionName: string, 
    data: Array<string | number | boolean | Function | Array<string> | {[s: string]: string | number}> = []
  ) => {
    if (this.player && this.player[functionName] && typeof this.player[functionName] === 'function') {      
      return this.player[functionName].call(this.player, ...data);
    } else {
      console.warn('Tried to proxy an function call to a player that is not yet ready.');
      return undefined;
    }
  }

  componentWillReceiveProps(nextProps: YoutubeProps) {
    /**
     * There are a few props that we do want to support in a particular way:
     * 
     * - videoId - if changed, play the single video specified
     * - list + listType - if changed, play the selected playlist / search result / user upload
     * - autoplay - if changed, pause or resume the video playback
     * - events - this is handled internally and does not require us updating anything
     * 
     * All other props would require changing the IFRAME and force a re-render of the component
     * which we want to disencourage.
     */
    if (nextProps.videoId && nextProps.videoId !== this.props.videoId) {      
      this.player.cueVideoById(nextProps.videoId, nextProps.start);
      if (nextProps.autoplay) {
        this.player.playVideo();
      }
    }
    if (nextProps.list && nextProps.list !== this.props.list) {
      this.proxyToPlayer('cuePlaylist', [{
        list: nextProps.list, 
        listType: ListType.playlist,
        index: '0',
        startSeconds: nextProps.start || 0
      }]);
      if (nextProps.autoplay) {
        this.player.playVideo();
      }      
    }
    if (nextProps.autoplay !== this.props.autoplay) {
      if (nextProps.autoplay) {
        this.player.playVideo();
      } else {
        this.player.pauseVideo();
      }
    }
  }

  render() {
    if (!this.props.render) {
      return <div id={this.state.playerName} />;
    } else {
      return this.props.render(this.callbackObject);
    }
  }

  callEventIfBound = (eventName: string, eventData: YT.PlayerEvent) => {
    if (this.props.events && this.props.events[eventName]) {
      this.props.events[eventName](eventData);
    }
  }

  /**
   * Since we are using render props we would not have the data for selected
   * state of the player updated in realtime. Instead we need to persist this sort
   * of data in component state.
   * 
   * The data is then synced:
   * 
   * - in an interval assuming the video is playing
   * - in response to specific user interaction
   * - in response to player event
   */
  sync = () => {
    this.setState({
      isMuted: this.player.isMuted(),
      volume: this.player.getVolume(),
      availablePlaybackRates: this.player.getAvailablePlaybackRates(),
      playerState: this.player.getPlayerState(),
      playbackRate: this.player.getPlaybackRate(),
      playbackQuality: this.player.getPlaybackQuality(),
      currentTime: Math.round(this.player.getCurrentTime()),
      duration: Math.round(this.player.getDuration()),
      videoUrl: this.player.getVideoUrl(),
      videoEmbedCode: this.player.getVideoEmbedCode(),
      playlist: this.player.getPlaylist(),
      playlistIndex: this.player.getPlaylistIndex(),
      videoLoadedFraction: this.player.getVideoLoadedFraction(),
    });    
  }

  startSync = () => {
    if (!this.syncInterval) {
      this.syncInterval = window.setInterval(this.sync, 1000);
    }
  }

  stopSync = () => {
    window.clearInterval(this.syncInterval);
    this.syncInterval = 0;
  }

  handleReady = (data: YT.PlayerEvent) => { 
    this.sync();
    this.callEventIfBound('onReady', data);
    this.forceUpdate();
  }

  handleStateChange = (data: YT.OnStateChangeEvent) => {
    if (data.data === 1) {
      this.startSync();
    } else {
      this.stopSync();
    }
    this.sync();
    
    this.callEventIfBound('onStateChange', data);
    this.forceUpdate();
  }

  handlePlaybackQualityChange = (data: YT.OnPlaybackQualityChangeEvent) => {
    this.callEventIfBound('onPlaybackQualityChange', data);
    this.forceUpdate();
  }

  handlePlaybackRateChange = (data: YT.OnPlaybackRateChangeEvent) => {
    this.callEventIfBound('onPlaybackRateChange', data);
    this.forceUpdate();
  }

  handleError = (data: YT.OnErrorEvent) => {
    this.callEventIfBound('onError', data);
    this.forceUpdate();
  }

  handleApiChange = (data: YT.PlayerEvent) => {
    this.callEventIfBound('onApiChange', data);
    this.forceUpdate();
  }

  initPlayer = () => {
    const playerConfig = {
      videoId: '',
      playerVars: this.getPlayerVars(),
      events: {
        onReady: this.handleReady,
        onStateChange: this.handleStateChange,
        onPlaybackQualityChange: this.handlePlaybackQualityChange,
        onPlaybackRateChange: this.handlePlaybackRateChange,
        onError: this.handleError,
        onApiChange: this.handleApiChange,
      }
    };
    if (
      this.props.list && (
        this.props.listType === ListType.playlist || 
        this.props.listType === ListType.search || 
        this.props.listType === ListType.userUploads
      )
    ) {
      delete playerConfig.videoId;
    } else {
      if (typeof this.props.videoId !== 'string') {
        throw new Error('Please make sure to either specify the videoId or list and listType props');
      }
      playerConfig.videoId = this.props.videoId;
    }
    this.player = new YT.Player(this.state.playerName, playerConfig);

    this.forceUpdate();
  }

  componentDidMount() {  
    if (document.querySelector('[data-youtube]')) {
      YoutubePlayer.loadPromise.then(this.initPlayer);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.dataset.youtube = 'true';
    const firstScriptTag: HTMLHeadElement = document.getElementsByTagName('head')[0];
    firstScriptTag.appendChild(tag);
  
    YoutubePlayer.loadPromise = new Promise((res) => {
      (window as Window & {[s: string]: Function}).onYouTubeIframeAPIReady = () => {
        this.initPlayer();
        res();
      };
    });
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.destroy();
    }
    this.stopSync();
  }
}