
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
		searchResultsURL:"/rest/getEmployeesWithSkills"
		
	},

	init: function(obj, options){
		var self = this;
	
		this.props = $.extend( true, {}, this.defaults, options ); //combine props
		this.$obj=$(obj); this.$obj.data("obj",this); //Create references to $(obj)
		
		this.$obj.addClass("SearchObj");
		this.$logo = $("<div class='logo' />").appendTo( this.$obj );
		this.$tagLine = $("<div class='tagLine'>Your Journey Begins Here</div>").appendTo( this.$obj );
		this.$searchBox = $("<input type='text' class='searchBox' />")	
			.keyup( function(e){
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
				data: {skill:self.$searchBox.val()},
				success: function(json){
					if(!$.isEmptyObject(json)){
						self.searchResults = json;
						
						
						// TO-DO - Fix logic for looping and placing divs
						var index = 1;
						var $result = $("<div class='searchResultSection name' />").appendTo( self.$results);
												
						$("<div class='title'>People</div>").appendTo( $result );
						
						$result.delay(50*index).animate({opacity:1}, 300 );
						$result.css( { left:305 * (index-1)} );
						
						for( resultName in self.searchResults ){
							// Name column
							$("<div class='searchResultItem'>" + self.searchResults[resultName].first_name + ' ' +  self.searchResults[resultName].last_name + "</div>").appendTo( $result );
						}
						
						// TO-DO - Fix logic for looping and placing divs
						var index = 2;
						var $result = $("<div class='searchResultSection name' />").appendTo( self.$results);
						
						$("<div class='title'>Skill</div>").appendTo( $result );
						
						$result.delay(50*index).animate({opacity:1}, 300 );
						$result.css( { left:305 * (index-1)} );
						
						for( resultName in self.searchResults ){
							// Skill column
							$("<div class='searchResultItem'>" + self.searchResults[resultName].skill_name + "</div>").appendTo( $result );
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

