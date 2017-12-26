react-yt 
=============================

A full-fledged wrapper for the Youtube Player API created with the render props pattern.

## Example

https://btmpl.github.io/react-yt/

## Features
- playback of single video or supported lists (playlist, user uploads, search results),
- full access to the Youtube Player API inside the render prop,
- access to the player instance as an escape hatch,
- ability to control selected features as props to the component

## Installation

```
$ yarn add react-yt
```

Minimal usage example
----
```js
/**
 * We are using `module` field to provide an ES module format
 * and `main` field for an CommonJS fallback
 */
import YouTube from "react-yt";
```
```js
<YouTube
  videoId={'SKGzIhOSQVY'}
  autoplay={true}
/>
```

## Accepted props

The player accepts all the official [player parameters](https://developers.google.com/youtube/player_parameters?hl=pl#listtype) as props. 

Prop name|TypeScript type|Accepted values
---|---|---
`autoplay`|`YT.AutoPlay`|`0 \| 1`
`ccLoadPolicy`|`YT.ClosedCaptionsLoadPolicy`|`0 \| 1`
`color` | `YT.ProgressBarColor`|`"white" \| "red"`
`controls` | `YT.Controls`|`0 \| 1`
`disablekb` | `YT.KeyboardControls`|`0 \| 1`
`enableJsApi` | `YT.JsApi`|`0 \| 1`
`end` | `number`|`number`
`fs` | `YT.FullscreenButton`|`0 \| 1`
`hl` | `string`|ISO 639-1 languag code
`ivLoadPolicy` | `YT.IvLoadPolicy`|`0 \| 1`
`list` | `string`|`string`
`listType` | `ListType`|`"playlist" \| "user_uploads" \| "search"`
`loop` | `YT.Loop`|`0 \| 1`
`modestbranding` | `YT.ModestBranding`|`0 \| 1`
`origin` | `string`|`string`
`playlist` | `string`|`string`
`playsinline` | `YT.PlaysInline`|`0 \| 1`
`rel` | `YT.RelatedVideos`|`0 \| 1`
`showinfo` | `YT.ShowInfo`|`0 \| 1`
`start` | `number`|`number`
`videoId` | `string`|`string`

Additionally it's possible to subscribe to the Player events by providing an `events` prop with following keys:

Key name|Event signature
---|---
`onReady`|`YT.PlayerEventHandler<YT.PlayerEvent>`
`onStateChange`|`YT.PlayerEventHandler<YT.OnStateChangeEvent>`
`onPlaybackQualityChange`|`YT.PlayerEventHandler<YT.OnPlaybackQualityChangeEvent>`
`onPlaybackRateChange`|`YT.PlayerEventHandler<YT.OnPlaybackRateChangeEvent>`
`onError`|`YT.PlayerEventHandler<YT.OnErrorEvent>`
`onApiChange`|`YT.PlayerEventHandler<YT.PlayerEvent>`

## Using the render prop

The render prop (`render`) will be called with an object exposing:

Field name|Content
---|---
iframe|The `iframe` React Element containing the player
player|The `player` instance, allowing access to all internal mechanics

And all the internal Youtube player functions:

Function name|Parameters|Return type
---|---|---
`loadVideoById`|`videoId: string[, startSeconds: number, suggestedQuality: string]`|`void`
`cueVideoByUrl`|`videoId: string[, startSeconds: number, suggestedQuality: string]`|`void`
`loadVideoByUrl`|`videoUrl: string[, startSeconds: number, suggestedQuality: string]`|`void`
`loadPlaylist`|`playlist: string\|Array[, index: number, startSeconds: number, suggestedQuality: string]`|`void`
`cuePlaylist`|`playlist: string\|Array[, index: number, startSeconds: number, suggestedQuality: string]`|`void`
`pauseVideo`|`void`|`void`
`playVideo`|`void`|`void`
`mute`|`void`|`void`
`unMute`|`void`|`void`
`isMuted`|`void`|`boolean`
`setVolume`|`number`|`void`
`getVolume`|`void`|`number`
`stopVideo`|`void`|`void`
`clearVideo`|`void`|`void`
`nextVideo`|`void`|`void`
`previousVideo`|`void`|`void`
`playVideoAt`|`number`|`void`
`seekTo`|`number`|`void`
`getPlaybackRate`|`void`|`number`
`setPlaybackRate`|`number`|`void`
`getAvailablePlaybackRates`|`void`|`Array<number>`
`setLoop`|`boolean`|`void`
`setShuffle`|`boolean`|`void`
`getPlayerState`|`void`|`number`
`getCurrentTime`|`void`|`number`
`getPlaybackQuality`|`void`|`string`
`setPlaybackQuality`|`string`|`void`
`getVideoLoadedFraction`|`void`|`float`
`getDuration`|`void`|`number`
`getVideoUrl`|`void`|`string`
`getVideoEmbedCode`|`void`|`string`
`getPlaylist`|`void`|`Array<string>`
`getPlaylistIndex`|`void`|`number`
`addEventListener`|`string`, `Function`|`void`
`removeEventListener`|`string`, `Function`|`void`

## Rendering with render props

```js
<YouTube
  videoId={'SKGzIhOSQVY'}
  render={({
    iframe,
    playVideo,
    pauseVideo,
    getPlayerState
  }) => (
    <div>
      {iframe}
      {getPlayerState() !== 1 && <button onClick={(event) => playVideo()}>Play video</button>}
      {getPlayerState() === 1 && <button onClick={(event) => pauseVideo()}>Pause video</button>}
    </div>
  )}
/>
```

## Controlling the player from outside

While the recommended way to control the playback is from inside the render prop function, it is also possible to control the component from outside by changing the props. Developers are able to provide the following props in order to control the component without having to remount it.

Prop|Result
---|---
videoId|When given a non-falsy value, the selected video will play
list + listType |When given a non-falsy value, the selected list will play
autoplay|Controls the playback state, `false` to pause the playback, or `true` to start / resume

The logic uses `componentWillReceiveProps` to control the playback, so passing the props in a given order will override older props. Passing new values to both props at the same time will give priority to the `videoId` prop.


# License

  MIT