(function( $ ) {
	'use strict';

	/**
	 * All of the code for your public-facing JavaScript source
	 * should reside in this file.
	 *
	 * Note: It has been assumed you will write jQuery code here, so the
	 * $ function reference has been prepared for usage within the scope
	 * of this function.
	 *
	 * This enables you to define handlers, for when the DOM is ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * When the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and/or other possibilities.
	 *
	 * Ideally, it is not considered best practise to attach more than a
	 * single DOM-ready or window-load handler for a particular page.
	 * Although scripts in the WordPress core, Plugins and Themes may be
	 * practising this, we should strive to set a better example in our own work.
	 */

	$(document).ready(function(){

		function youtubeWall(opts){
			this._opts = opts;
			this._main = opts.main;
			this._liveStream = opts.liveStream;
			this._container = opts.container;
			this._videoapi = opts.videoapi;
			this._videoapi2 = opts.videoapi2;
			this._columnCount = opts.columnCount;
			this._videoClick = opts.videoClick;
			this.playlistCheck = opts.playlistCheck;
			this.playlistjson = opts.playlistjson;
			this.videosidCheck = opts.videosidCheck;
			this.videosidjson = opts.videosidjson;
			this.thumb = opts.thumb;
			this._rotator = opts.rotator;
			this._playlistContainer = opts.playlistContainer;
			this._videosContainer = opts.videosContainer;

			/* Conditional pulls */
			var dataChannelLogo = this._main.attr('data-channel-logo');
			/* Conditional pulls */

			/* Functions to be called for Channel videos which is by default */
			this._elemAnchor(this._videoapi,1);
			if(dataChannelLogo == 1){
				this._elemAnchor(this._videoapi2,2);
			}

			/* Functions to be called when popup needs to work over tile click */
			if(this._videoClick == 1){
				this._elemPopup();
				this._popupClose();
			}

			/* Function to be called when Playlist videos needs to be shown as per the selected ID */
			if(this.playlistCheck.length){
				this._playlistLoad(this.playlistjson);
			}

			/* Functions to be called when custom videos needs to be shown as per the given set of ids */
			if(this.videosidCheck.length){
				this._videosid(this.videosidjson,1);
				if(dataChannelLogo == 1){
					this._videosid(this.videosidjson,2);
				}
			}				
		}
		
		youtubeWall.prototype = Object.create(null,{
			constructor: {
				value: youtubeWall
			},
			_elemAnchor:{
				value: function(args,args2){
					var _apiKeyToBeFetchedAjax = this._container.attr('data-apikey');
					var _tileBackground = this._main.attr('data-tile-background');
					var _tileTextColor = this._main.attr('data-tile-text');
					var _tileBorderCheck = this._main.attr('data-tile-border');
					if(_tileBorderCheck == 1){
						var _tileBorderRadius = this._main.attr('data-tile-borderradius');
						var _tileBorderColor = this._main.attr('data-tile-bordercolor');
					}
					else{
						var _tileBorderRadius = '0px';
						var _tileBorderColor = 'transparent';
					}
					var dataVideoViews = this._main.attr('data-video-views');
					var dataVideoLikes = this._main.attr('data-video-likes');
					var container = this._container;
					var liveStream = this._liveStream;
					var videoThumb = this.thumb;
					var rotator = this._rotator;
					var main = this._main;

					/* Call to fetch videos for the given channel id */
					$.ajax({
						url: args,
						type: 'GET',                
						success: function(data) {
							if(data.items != undefined){
								if (data.items.length) {
									if(args2 == 1){
										var _liveStremCheck = 0;
										for(var i=0;i<data.items.length;i++){
											var _videoId = data.items[i].id.videoId;
											var _videoTitle = data.items[i].snippet.title;
											var _channelTitle = data.items[i].snippet.channelTitle;
											if(data.items[i].snippet.thumbnails.high != undefined){
												var _videoThumbFetch = data.items[i].snippet.thumbnails.high.url;
												var _videoThumb = _videoThumbFetch.replace("hqdefault", "maxresdefault");
											}
											var _videoUrl = '//youtube.com/watch?v='+_videoId;
											var _childWidthFetch = main.attr('data-columncount');
											var _childWidth = 100/_childWidthFetch+'%';
											var _childSpacing = main.attr('data-column-spacing')+'px';
											var _childSpacingHalf = (main.attr('data-column-spacing')/2)+'px';
											if(data.items[i].snippet.liveBroadcastContent == 'live'){
												var streamvideourl = '//www.youtube.com/embed/'+_videoId+'?autoplay=1&rel=0';
												var liveVideo = '<div class="cp-liveStream"><iframe class="js-videoLoad" src="'+streamvideourl+'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
												liveStream.append(liveVideo);
												_liveStremCheck = 1;
											}
											else{
												/* Make this call only if View and Likes are checked */
												if(dataVideoViews == 1 || dataVideoLikes == 1){
													var _getchVideoStatistics = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id='+_videoId+'&key='+_apiKeyToBeFetchedAjax;
													var _viewCount = 0;
													var _likeCount = 0;
													$.ajax({
														url: _getchVideoStatistics,
														type: 'GET',         
														async: false,       
														success: function(data) {
															if (data.items.length) {
																for(var i=0;i<data.items.length;i++){
																	_viewCount = data.items[i].statistics.viewCount;
																	_likeCount = data.items[i].statistics.likeCount;
																}
															}
															else{
																console.log('Video details not found');
															}
														},
														error: function(data) {
															console.log('Video details not found');
														}
													});
													var _sectionMarkUp = '<a data-videoid="'+_videoId+'" style="width:calc('+_childWidth+' - '+_childSpacing+');margin:'+_childSpacingHalf+';background-color:'+_tileBackground+';color:'+_tileTextColor+';border-radius:'+_tileBorderRadius+';border:1px solid '+_tileBorderColor+';" class="cp-youtubeWallVideo js-videoPopup js-videos" href="'+_videoUrl+'" target="_blank"><div class="gwt-relative"><img loading="lazy" src="'+_videoThumb+'" alt="'+_videoTitle+'"><span class="cp-youtubeIcon"><span class="cp-youtubeIcon__triangle"></span></span></div><span class="cp-youtubeWallVideo__content"><span class="cp-youtubeWallVideo__thumb"></span><span class="cp-youtubeWallVideo__extras"><span class="cp-youtubeWallVideo__title">'+_videoTitle+'</span><span class="cp-youtubeWallVideo__channelName">'+_channelTitle+'</span><span class="cp-youtubeWallVideo__viewsPublished"><span>'+_viewCount+' Views </span><span>'+_likeCount+' Likes</span></span></span></span><div class="cp-videos__grid-overlay"></div></a>';
												}
												else{
													var _sectionMarkUp = '<a data-videoid="'+_videoId+'" style="width:calc('+_childWidth+' - '+_childSpacing+');margin:'+_childSpacingHalf+';background-color:'+_tileBackground+';color:'+_tileTextColor+';border-radius:'+_tileBorderRadius+';border:1px solid '+_tileBorderColor+';" class="cp-youtubeWallVideo js-videoPopup js-videos" href="'+_videoUrl+'" target="_blank"><div class="gwt-relative"><img loading="lazy" src="'+_videoThumb+'" alt="'+_videoTitle+'"><span class="cp-youtubeIcon"><span class="cp-youtubeIcon__triangle"></span></span></div><span class="cp-youtubeWallVideo__content"><span class="cp-youtubeWallVideo__thumb"></span><span class="cp-youtubeWallVideo__extras"><span class="cp-youtubeWallVideo__title">'+_videoTitle+'</span><span class="cp-youtubeWallVideo__channelName">'+_channelTitle+'</span></span></span><div class="cp-videos__grid-overlay"></div></a>';
												}
												container.append(_sectionMarkUp);
											}
										}
										if(_liveStremCheck == 0){
											liveStream.hide();
										}
									}
									else if(args2 == 2){
										setTimeout(function(){ 
											for(var i=0;i<data.items.length;i++){
												var _channelAvatar = data.items[i].snippet.thumbnails.medium.url;
												var _channelAvatarAlt = data.items[i].snippet.title;
												var _appendAvatar = '<img src="'+_channelAvatar+'" alt="'+_channelAvatarAlt+'" />';
												var _section = '.cp-youtubeWall__allVideos .cp-youtubeWallVideo__thumb';
												$(_section).append(_appendAvatar);
											}
										}, 500);
									}
								}
								else{
									container.append('<p class="l-notice">No videos found for this channel</p>')
								}
							}
							rotator.hide();
						},
						error: function(data) {
							container.hide();
						}
					});
				}
			},
			_elemPopup:{
				value: function(){
					setTimeout(function(){ 
						$('.js-videoPopup').click(function(e){
							e.preventDefault();
							var _videoId = $(this).attr('data-videoid');
							var videoLoadUrl = '//www.youtube.com/embed/'+_videoId+'?autoplay=1&rel=0';
							var iframeTemplate = '<iframe class="js-videoLoad" src="'+videoLoadUrl+'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
							$(this).closest('.cp-youtubeWall').next('.cp-youtubepopup').children('.cp-youtubepopup__inner').append(iframeTemplate);
							$(this).closest('.cp-youtubeWall').next('.cp-youtubepopup').addClass('is-active');
							$('body').addClass('overflow');
						});
					},1000);
				}
			},
			_popupClose:{
				value: function(){
					setTimeout(function(){ 
						$('.js-close').click(function(){
							$('.cp-youtubepopup__inner').html('');
							$('.cp-youtubepopup').removeClass('is-active');
							$('body').removeClass('overflow');
						});
					},1000);
				}
			},			
			_playlistLoad:{
				value: function(args){
					var fetchChannelId = '';
					var _apiKeyToBeFetched = this._container.attr('data-apikey');
					var _videoUrlChannelDetails = '';
					var _tileBackground = this._main.attr('data-tile-background');
					var _tileTextColor = this._main.attr('data-tile-text');
					var _tileBorderCheck = this._main.attr('data-tile-border');
					if(_tileBorderCheck == 1){
						var _tileBorderRadius = this._main.attr('data-tile-borderradius');
						var _tileBorderColor = this._main.attr('data-tile-bordercolor');
					}
					else{
						var _tileBorderRadius = '0px';
						var _tileBorderColor = 'transparent';
					}
					var dataVideoViews = this._main.attr('data-video-views');
					var dataVideoLikes = this._main.attr('data-video-likes');
					var container = this._container;
					var videoThumb = this.thumb;
					var rotator = this._rotator;
					var playlistContainer = this._playlistContainer;
					var main = this._main;

					/* Call to fetch playlist items for the given playlist id */
					$.ajax({
						url: args,
						type: 'GET',                
						success: function(data) {
							if (data.items.length) {
								for(var i=0;i<data.items.length;i++){
									var _videoId = data.items[i].snippet.resourceId.videoId;
									var _videoTitle = data.items[i].snippet.title;
									var _channelTitle = data.items[i].snippet.channelTitle;
									if(data.items[i].snippet.thumbnails.standard != undefined){
										var _videoThumbFetch = data.items[i].snippet.thumbnails.standard.url;
										var _videoThumb = _videoThumbFetch.replace("hqdefault", "maxresdefault");
									}
									var _videoUrl = '//youtube.com/watch?v='+_videoId;
									var _childWidthFetch = main.attr('data-columncount');
									var _childWidth = 100/_childWidthFetch+'%';
									var _childSpacing = main.attr('data-column-spacing')+'px';
									var _childSpacingHalf = (main.attr('data-column-spacing')/2)+'px';

									if(i == 0){
										fetchChannelId = data.items[i].snippet.channelId;
										_videoUrlChannelDetails = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&id='+fetchChannelId+'&key='+_apiKeyToBeFetched;
									}
									if(dataVideoViews == 1 || dataVideoLikes == 1){
										var _getchPlaylistVideoStatistics = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id='+_videoId+'&key='+_apiKeyToBeFetched;
										var _viewCount = 0;
										var _likeCount = 0;
										$.ajax({
											url: _getchPlaylistVideoStatistics,
											type: 'GET',         
											async: false,       
											success: function(data) {
												if (data.items.length) {
													for(var i=0;i<data.items.length;i++){
														_viewCount = data.items[i].statistics.viewCount;
														_likeCount = data.items[i].statistics.likeCount;
													}
												}
												else{
													console.log('Video details not found');
												}
											},
											error: function(data) {
												console.log('Video details not found');
											}
										});																	
										var _sectionMarkUp = '<a data-videoid="'+_videoId+'" style="width:calc('+_childWidth+' - '+_childSpacing+');margin:'+_childSpacingHalf+';background-color:'+_tileBackground+';color:'+_tileTextColor+';border-radius:'+_tileBorderRadius+';border:1px solid '+_tileBorderColor+';" class="cp-youtubeWallVideo js-videoPopup js-playlist" href="'+_videoUrl+'" target="_blank"><div class="gwt-relative"><img loading="lazy" src="'+_videoThumb+'" alt="'+_videoTitle+'"><span class="cp-youtubeIcon"><span class="cp-youtubeIcon__triangle"></span></span></div><span class="cp-youtubeWallVideo__content"><span class="cp-youtubeWallVideo__thumb"></span><span class="cp-youtubeWallVideo__extras"><span class="cp-youtubeWallVideo__title">'+_videoTitle+'</span><span class="cp-youtubeWallVideo__channelName">'+_channelTitle+'</span><span class="cp-youtubeWallVideo__viewsPublished"><span>'+_viewCount+' Views </span><span>'+_likeCount+' Likes</span></span></span></span><div class="cp-videos__grid-overlay"></div></a>';
									}
									else{
										var _sectionMarkUp = '<a data-videoid="'+_videoId+'" style="width:calc('+_childWidth+' - '+_childSpacing+');margin:'+_childSpacingHalf+';background-color:'+_tileBackground+';color:'+_tileTextColor+';border-radius:'+_tileBorderRadius+';border:1px solid '+_tileBorderColor+';" class="cp-youtubeWallVideo js-videoPopup js-playlist" href="'+_videoUrl+'" target="_blank"><div class="gwt-relative"><img loading="lazy" src="'+_videoThumb+'" alt="'+_videoTitle+'"><span class="cp-youtubeIcon"><span class="cp-youtubeIcon__triangle"></span></span></div><span class="cp-youtubeWallVideo__content"><span class="cp-youtubeWallVideo__thumb"></span><span class="cp-youtubeWallVideo__extras"><span class="cp-youtubeWallVideo__title">'+_videoTitle+'</span><span class="cp-youtubeWallVideo__channelName">'+_channelTitle+'</span></span></span><div class="cp-videos__grid-overlay"></div></a>';
									}
									playlistContainer.append(_sectionMarkUp);
								}
							}
							else{
								console.log('No playlist found');
							}
							rotator.hide();
						},
						error: function(data) {
							console.log('No playlist found');
						}
					});
					/* Call to fetch logo of the channel */
					setTimeout(function(){
						$.ajax({
							url: _videoUrlChannelDetails,
							type: 'GET',                
							success: function(data) {
								if (data.items.length) {
									setTimeout(function(){ 
										for(var i=0;i<data.items.length;i++){
											var _channelAvatar = data.items[i].snippet.thumbnails.medium.url;
											var _channelAvatarAlt = data.items[i].snippet.title;
											var _appendAvatar = '<img src="'+_channelAvatar+'" alt="'+_channelAvatarAlt+'" />';
											var _section = '.cp-playlist__videos .cp-youtubeWallVideo__thumb';
											$(_section).append(_appendAvatar);
										}
									}, 500);
								}
								else{
									console.log('No playlist found');
								}
							},
							error: function(data) {
								console.log('No playlist found');
							}
						});
					},2000);
				}
			},
			_videosid:{
				value: function(args,args2){
					var _apiKeyToBeFetchedAjax = this._container.attr('data-apikey');
					var _tileBackground = this._main.attr('data-tile-background');
					var _tileTextColor = this._main.attr('data-tile-text');
					var _tileBorderCheck = this._main.attr('data-tile-border');
					if(_tileBorderCheck == 1){
						var _tileBorderRadius = this._main.attr('data-tile-borderradius');
						var _tileBorderColor = this._main.attr('data-tile-bordercolor');
					}
					else{
						var _tileBorderRadius = '0px';
						var _tileBorderColor = 'transparent';
					}
					var dataVideoViews = this._main.attr('data-video-views');
					var dataVideoLikes = this._main.attr('data-video-likes');
					var container = this._container;;
					var rotator = this._rotator;
					var videosContainer = this._videosContainer;
					var main = this._main;

					/* Call to fetch videos for the given channel id */
					$.ajax({
						url: args,
						type: 'GET',                
						success: function(data) {
							if (data.items.length) {
								if(args2 == 1){
									for(var i=0;i<data.items.length;i++){
										var _videoId = data.items[i].id;
										var _videoTitle = data.items[i].snippet.title;
										var _channelTitle = data.items[i].snippet.channelTitle;
										if(data.items[i].snippet.thumbnails.high != undefined){
											var _videoThumbFetch = data.items[i].snippet.thumbnails.high.url;
											var _videoThumb = _videoThumbFetch.replace("hqdefault", "maxresdefault");
										}
										var _videoUrl = '//youtube.com/watch?v='+_videoId;
										var _childWidthFetch = main.attr('data-columncount');
										var _childWidth = 100/_childWidthFetch+'%';
										var _childSpacing = main.attr('data-column-spacing')+'px';
										var _childSpacingHalf = (main.attr('data-column-spacing')/2)+'px';
										if(dataVideoViews == 1 || dataVideoLikes == 1){
											var _getchVideoStatistics = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id='+_videoId+'&key='+_apiKeyToBeFetchedAjax;
											var _viewCount = 0;
											var _likeCount = 0;
											$.ajax({
												url: _getchVideoStatistics,
												type: 'GET',         
												async: false,       
												success: function(data) {
													if (data.items.length) {
														for(var i=0;i<data.items.length;i++){
															_viewCount = data.items[i].statistics.viewCount;
															_likeCount = data.items[i].statistics.likeCount;
														}
													}
													else{
														console.log('Video details not found');
													}
												},
												error: function(data) {
													console.log('Video details not found');
												}
											});
											var _sectionMarkUp = '<a data-videoid="'+_videoId+'" style="width:calc('+_childWidth+' - '+_childSpacing+');margin:'+_childSpacingHalf+';background-color:'+_tileBackground+';color:'+_tileTextColor+';border-radius:'+_tileBorderRadius+';border:1px solid '+_tileBorderColor+';" class="cp-youtubeWallVideo js-videoPopup js-videos" href="'+_videoUrl+'" target="_blank"><div class="gwt-relative"><img loading="lazy" src="'+_videoThumb+'" alt="'+_videoTitle+'"><span class="cp-youtubeIcon"><span class="cp-youtubeIcon__triangle"></span></span></div><span class="cp-youtubeWallVideo__content"><span class="cp-youtubeWallVideo__thumb"></span><span class="cp-youtubeWallVideo__extras"><span class="cp-youtubeWallVideo__title">'+_videoTitle+'</span><span class="cp-youtubeWallVideo__channelName">'+_channelTitle+'</span><span class="cp-youtubeWallVideo__viewsPublished"><span>'+_viewCount+' Views </span><span>'+_likeCount+' Likes</span></span></span></span><div class="cp-videos__grid-overlay"></div></a>';
										}
										else{
											var _sectionMarkUp = '<a data-videoid="'+_videoId+'" style="width:calc('+_childWidth+' - '+_childSpacing+');margin:'+_childSpacingHalf+';background-color:'+_tileBackground+';color:'+_tileTextColor+';border-radius:'+_tileBorderRadius+';border:1px solid '+_tileBorderColor+';" class="cp-youtubeWallVideo js-videoPopup js-videos" href="'+_videoUrl+'" target="_blank"><div class="gwt-relative"><img loading="lazy" src="'+_videoThumb+'" alt="'+_videoTitle+'"><span class="cp-youtubeIcon"><span class="cp-youtubeIcon__triangle"></span></span></div><span class="cp-youtubeWallVideo__content"><span class="cp-youtubeWallVideo__thumb"></span><span class="cp-youtubeWallVideo__extras"><span class="cp-youtubeWallVideo__title">'+_videoTitle+'</span><span class="cp-youtubeWallVideo__channelName">'+_channelTitle+'</span></span></span><div class="cp-videos__grid-overlay"></div></a>';
										}
										videosContainer.append(_sectionMarkUp);
									}
								}
								else if(args2 == 2){
									setTimeout(function(){ 
										for(var i=0;i<data.items.length;i++){
											var _channelID = data.items[i].snippet.channelId;
											var _videoUrlChannelDetails = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&id='+_channelID+'&key='+_apiKeyToBeFetchedAjax;
											var _count = i;
											$.ajax({
												url: _videoUrlChannelDetails,
												type: 'GET',         
												async: false,       
												success: function(data) {
													if (data.items.length) {
														for(var i=0;i<data.items.length;i++){
															var _channelAvatar = data.items[i].snippet.thumbnails.medium.url;
															var _channelAvatarAlt = data.items[i].snippet.title;
															var _appendAvatar = '<img src="'+_channelAvatar+'" alt="'+_channelAvatarAlt+'" />';
															var appendurl = '.cp-videosid .cp-videosid__videos a:nth-child('+(_count+1)+') .cp-youtubeWallVideo__thumb';
															$(appendurl).append(_appendAvatar);
														}
													}
													else{
														console.log('Video details not found');
													}
												},
												error: function(data) {
													console.log('Video details not found');
												}
											});
										}
									}, 500);
								}
							}
							else{
								container.append('<p class="l-notice">No videos found for this channel</p>')
							}
							rotator.hide();
						},
						error: function(data) {
							container.hide();
						}
					});
				}
			},									
		});
		
		/* Pull in input variables from data attribute */
		$(window).load(function(){

			$('.cp-youtubeWall').each(function(){
				var _this = '.cp-youtubeWall-'+$(this).attr('data-id');
				var _numberOfVideos = $(_this).find('.cp-youtubeWall__allVideos').attr('data-videoCount');
				var _channelId = $(_this).find('.cp-youtubeWall__allVideos').attr('data-channelid');
				var _apiKey = $(_this).find('.cp-youtubeWall__allVideos').attr('data-apikey');
				var _playlistId = $(_this).find('.cp-playlist').attr('data-playlistid');
				var _videoIds = $(_this).find('.cp-videosid').attr('data-videoid');
				var _videoUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId='+_channelId+'&maxResults='+_numberOfVideos+'&order=date&type=video&key='+_apiKey;
				var _videoUrlChannelDetails = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&id='+_channelId+'&key='+_apiKey+'&maxResults=100';
				var _videoClick = $(_this).find('.cp-youtubeWall__allVideos').attr('data-videoClick');
				var _playlistjson = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status,contentDetails&playlistId='+_playlistId+'&key='+_apiKey+'&maxResults='+_numberOfVideos;
				var _videosidjson = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,status,contentDetails&id='+_videoIds+'&key='+_apiKey;

				// function call
				var youtubeWallAPI = new youtubeWall({
					main : $(_this),
					liveStream: $(_this).find('.cp-youtubeWall__liveStream'),
					container : $(_this).find('.cp-youtubeWall__allVideos'),
					thumb : $(_this).find('.cp-youtubeWallVideo__thumb'),
					rotator: $(_this).find('.gwt-rotator'),
					videoapi: _videoUrl,
					videoapi2: _videoUrlChannelDetails,
					videoClick : _videoClick,
					playlistCheck: $(_this).find('.cp-playlist'),
					playlistjson : _playlistjson,
					playlistContainer: $(_this).find('.cp-playlist__videos'),
					videosidCheck: $(_this).find('.cp-videosid'),
					videosidjson : _videosidjson,
					videosContainer: $(_this).find('.cp-videosid__videos'),
				});
			});
			
		});

	});

})( jQuery );
