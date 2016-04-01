
var Singularity = Singularity || {};

//------------------- Helper Function That Calculates Color -------------------//
Singularity.calcColorBGR = function( v, L, M, H ){
	var lowColor = {r:50, g:150, b:255};
	var medColor = {r:100, g:225, b:100};
	var highColor = {r:225, g:125, b:75};

	if( v < L ){
		var c = lowColor;
	} else if( v < M ){
		var t = (v-L)/(M-L);
		var c = {
			r:(medColor.r-lowColor.r)*t+lowColor.r,
			g:(medColor.g-lowColor.g)*t+lowColor.g,
			b:(medColor.b-lowColor.b)*t+lowColor.b
		};
	} else if( v > H ){
		var c = highColor;
	} else {
		var t = (v-M)/(H-M);
		var c = {
			r:(highColor.r-medColor.r)*t+medColor.r,
			g:(highColor.g-medColor.g)*t+medColor.g,
			b:(highColor.b-medColor.b)*t+medColor.b
		};
	}

	return( "rgb("+Math.round(c.r)+","+Math.round(c.g)+","+Math.round(c.b)+")" )
}

//------------------------- Search Object-------------------------//
// 
//----------------------------------------------------------------//
$.fn.searchPage = function( sage, options ){ //Core Line Extension
	return( this.each( function(){
		new Singularity.SearchPage( this, sage, options );
	}));
}

Singularity.SearchPage = Class.extend({
	defaults:{
		hasSearched:false,
		searchResultsURL:"data/searchResults.json"
		
	},

	init: function(obj, options){
		var self = this;
	
		this.props = $.extend( true, {}, this.defaults, options ); //combine props
		this.$obj=$(obj); this.$obj.data("obj",this); //Create references to $(obj)
		
		this.$obj.addClass("SearchObj");
		this.$logo = $("<div class='logo' />").appendTo( this.$obj );
		this.$tagLine = $("<div class='tagLine'>Your Journey Begins Here</div>").appendTo( this.$obj );
		this.$searchBox = $("<input type='text' class='searchBox' />")	
			.keypress( function(e){
				self.props.hasSearched = (self.$searchBox.val() != "");
				self.render();
			})
			.appendTo( this.$obj );

		this.$results = $("<div class='searchResults'/>").appendTo( this.$obj );		
		
		this.render();
	},
	
	render: function(){
		var self = this;
		if( this.props.hasSearched ){
			this.$obj.addClass( "Searched" );
			this.$results.html("");

			$.ajax({
				url: self.props.searchResultsURL,
				data: {}, //The search box can be accessed with: self.$searchBox.val()
				success: function(json){
					self.searchResults = JSON.parse(json);
				
					var index = 0;
					for( resultName in self.searchResults ){
						index++;
						var $result = $("<div class='searchResultSection' />").appendTo( self.$results);
						$result.delay(50*index).animate({opacity:1}, 300 );
						$result.css( { left:305 * (index-1)} );
						$("<div class='title'>" + resultName + "</div>").appendTo( $result );
						for( var i=0; i<self.searchResults[resultName].length; i++ ){
							$("<div class='searchResultItem'>" + self.searchResults[resultName][i] + "</div>").appendTo( $result );
						}
					}			
				}
			});





		} else {
			this.$obj.removeClass( "Searched" );
			
		}
	}
	
	

});



$().ready(function(){
	/*
	var param = document.URL.split('#')[1];
	if( param == "manager"){
		$('#container').scheduler({readOnly:false});
	} else {
		$('#container').scheduler();
	}
	*/
	$('#container').searchPage();

	
});

