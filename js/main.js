      $(document).ready(function() {
        $(".fancybox-thumb, .fancybox-media").fancybox({
          prevEffect  : 'none',
          nextEffect  : 'none',
          openEffect  : 'none',
          closeEffect : 'none',
          helpers : {
            title : {
              type: 'outside'
            },
            thumbs  : {
              width : 50,
              height  : 50
            },
            media : {
              youtube: {
                params :{
                  autoplay:1,
                  vq: "hd1080"
                },
                url:"//www.youtube.com/v/$3"

              }
            }
          },
          iframe:{
            scrolling:'no',
            preload:true
          },
          padding: 0,
          wrapCSS: "item-pic",
          tpl : {
            closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
          },
          beforeLoad: function() {
            var el, id = $(this.element).data('title-id');

            if (id) {
                el = $('#' + id);

                if (el.length) {
                    this.title = el.html();
                }
            }
        }
      });

    });




if (window.location.hash === "") {
  localStorage.setItem('myhash','home');
} else {
  localStorage.setItem('myhash', window.location.hash.replace( /^#/, '' ));
}

console.log(window.location.hash);

  // $(window).bind('beforeunload', function() {
  //   localStorage.setItem('myhash', window.location.hash);
  //   console.log('hi');
  //   console.log();
  // });

  //  $(document).ready(function() {
  //    // correctHashChange(localStorage.getItem('myhash'));
  //   console.log("local stor" + localStorage.getItem('myhash'));
  //    $("#menu-option-"+localStorage.getItem('myhash')).click();
  //    console.log("#menu-option-"+localStorage.getItem('myhash'));
  // });

  //-------------title -----------------//
  var titleTemplate = Handlebars.compile($("#header-template").html());

  var context = {page: "bottle of suze", subPage: ""};
  var html    = titleTemplate(context);
  $("#page-titles").html(html);



  //------------------Backbone stuff-------------------------//
  var projectMenuTemplate = Handlebars.compile($('#project-menu-template').html()),
      projectInfoTemplate = Handlebars.compile($('#project-info-template').html()),
      projectContentTemplate = Handlebars.compile($('#project-content-template').html());


  /* Render the section items (model) to the element */
  var ProjectMenuView = Backbone.View.extend({
    el: '#content-body',
    initialize: function () {
      this.render();
    },
    template: projectMenuTemplate,
    render: function(){
      var view = this;
        view.$el.html(""); //empty the element
        var model = JSON.parse(JSON.stringify(view.model)); //cast model as an object
        $.each(model, function(key, val) {

            view.$el.append(view.template(val)); //add model to the element
          });
      }
    });

  var ProjectContentView = Backbone.View.extend({
    el: '#content-body',
    initialize: function () {
      this.render()
    },
    template: projectContentTemplate,
    render: function(){
      var view = this;
        view.$el.html(""); //empty the element
        var model = JSON.parse(JSON.stringify(view.model)); //cast model as an object
        $.each(model, function(key, val) {
            val.id=key;
            view.$el.append(view.template(val)); //add model to the element
          });
      }
  });

   var ProjectInfoView = Backbone.View.extend({
    el: '#more-info',
    initialize: function () {
      this.render()
    },
    template: projectInfoTemplate,
    render: function(){
      var view = this;
        view.$el.html(""); //empty the element
        var model = JSON.parse(JSON.stringify(view.model)); //cast model as an object
        view.$el.append(view.template(model)); //add model to the element
      }
  });



   var repressMenuClick = false;


  // Read from info.json file and attach models for each section to corresponding menu options
  var json = $.getJSON("info.json", function(data) {

    //sections
    $.each(data, function(key, val) {
      var model = this;
      var title = key;
      var type, section, content, isProjectMenu = true, description = "", active = true;

      $.each(val, function(key, val){
        if (key==="type") {
          type = val;
        } else if (key==="section") {
          section = val;
        } else if (key==="content") {
          content = val;
        } else if (key==="project menu") {
          isProjectMenu = val;
        } else if (key==="description") {
          description = val;
        } else if (key=="active") {
          active = val;
        }
      });

      // Do not create menu options for inactive sections.
      if (!active) return;

      var menuOptionClass;
      var $menuWrapper;

      if (type==="single" || type==="main") {
        menuOptionClass = "menu-option";
        $menuWrapper = $("<div></div>");
        $menuWrapper.addClass("menu-wrapper " + section);
      } else if (type==="sub") {
        menuOptionClass = "sub-menu-option";
        $menuWrapper = $('.menu-wrapper.' + section);
      }

      var $menuOption = $("<div>" + title + "</div>");
      $menuOption.addClass(menuOptionClass + " " + section);
      $menuOption.attr('id', 'menu-option-' + replaceSpacesWithDashes(title));

      //menu option shows content on click, underlines section title
      $menuOption.click(function() {
        emptyOutInfo();
        $("#non-project-description").html(description);

        window.location.hash = replaceSpacesWithDashes(title);

        if (!isProjectMenu) {
          var mod = new Backbone.Model(content);
          new ProjectContentView({model:mod});
        } else {
          var mod = new Backbone.Model(content);
          new ProjectMenuView({model:mod});

          $.each(content,function(key, val){
            var projContent, group;
            $.each(val, function(key,val){
              if (key==="project content") {
                projContent = val;
              } else if (key==="group") {
                group = val;
              }
            });


            $(".item-"+group).click(function() {
              $("#non-project-description").html("");

              var projMod = new Backbone.Model(projContent);
              new ProjectContentView({model:projMod});
              new ProjectInfoView({model:mod.get(key)});
              $("#more-info").css("display","block");

              //add back button
              $("#back").html("back");
              $("#back").click(function() {
                $menuOption.click();
              });

              //add a see more button
              // $("#see-more-button").html("see more");
            });
          });
        } //end else

        var parsedSection = parseSectionName(section);

        $(".menu-option").css("border-bottom", "3px solid var(--subAccent)");
        $(".menu-option." + section).css("border-bottom", "3px solid var(--accent)");

        $(".menu-option.clicked").removeClass("clicked");
        $(".menu-option." + section).addClass("clicked");

        if (type==="sub"){
         $("#page-titles").html(titleTemplate({page:parsedSection, subPage:title}));
        } else {
        $("#page-titles").html(titleTemplate({page:parsedSection}));
        }
      }); //end $menuOption click

      if (type==="main"){
          $menuOption.unbind("click");
          $menuOption.find("a").attr('href','javascript:;');
        }

      // //set initial page to home
      // if (section==="bottle-of-suze") {
      //    $menuOption.click();
      //   // $(".menu-option").css("border-bottom", "3px solid var(--subAccent)");
      //   // $(".menu-option." + section).css("border-bottom", "3px solid var(--accent)");

      //   $(".menu-option.bottle-of-suze").addClass("clicked");
      //   $(".menu-option." + section).css("border-bottom", "3px solid var(--accent)");
      // }


      //set initial page on reload (what is stored in local storage - initially home)
      var targetId = "menu-option-"+localStorage.getItem('myhash');
      // console.log("target " + targetId)
      if ($menuOption.attr('id') === targetId){
        $menuOption.click();
        // console.log('!!!!!!');
        $menuOption.addClass("clicked");
        $menuOption.css("border-bottom", "3px solid var(--accent)");
      }

      var underlineStatus;
      var accentColor = window.getComputedStyle($("#page").get(0)).color;

      //On hover, display the submenu of the menu option item
      $menuOption.hover(
        function () {
          var menuName = this.classList[1];
          $(".sub-menu-option." + menuName).css({"visibility":"visible", "opacity":"1"});

          underlineStatus = $(".menu-option."+section).css("border-bottom");

          //underline when hover
          $(".menu-option."+section).css("border-bottom", "3px solid var(--hoverAccent)");
        },
        function () {
          $(".sub-menu-option").css({"visibility":"hidden", "opacity":"0"});

          //if this section isnt clicked(already underlined), un-underline on exit
          if (underlineStatus==="3px solid " + accentColor) {
          $(".menu-option."+section).css("border-bottom", "3px solid var(--accent)");
          } else {
          $(".menu-option."+section).css("border-bottom", "3px solid var(--subAccent)");
          }

          //if was clicked during hover, make sure stays click color
          if ($(".menu-option." + section).hasClass("clicked")) {
            $(".menu-option."+section).css("border-bottom", "3px solid var(--accent)");
          }
        }); //end hover

      //for mobile (since no hover) - menu options appear/disappear when clicked
      if (type!="sub") {
        $menuOption.click(
          function () {
            if (!repressMenuClick) {

              var menuName = this.classList[1];
              $subMenuOption =  $(".sub-menu-option." + menuName);
              if($subMenuOption.css("visibility")==="hidden") {
                $(".sub-menu-option").css({"visibility":"hidden", "opacity":"0"});
                $subMenuOption.css({"visibility":"visible", "opacity":"1"});
              } else {
                $subMenuOption.css({"visibility":"hidden", "opacity":"0"});
              }
            } else {
              repressMenuClick = false;
            }
          });
      }

      $menuOption.appendTo($menuWrapper);     //add the menu option to wrapper
      if (type!="sub") {
        $menuWrapper.appendTo("#header");      //add wrapper to header
      }
    });
  }); //end json


  //remove dashes from section name
  var parseSectionName = function(name) {
    var splitName = name.split('-');
    var parsed="";
    for (var i = 0; i < splitName.length - 1; i++) {
      parsed += splitName[i] + " " ;
    }
    return parsed + splitName[splitName.length-1];
  };

  //replaces spaces with dashes for url
  var replaceSpacesWithDashes = function(name) {
    var splitName = name.split(' ');
    var parsed = "";
    for (var i = 0; i < splitName.length - 1; i++) {
      parsed += splitName[i] + "-" ;
    }

    return parsed + splitName[splitName.length-1];
  };

  //correct page when hash changes
  var correctHashChange = function(tgt) {
    // console.log("hash change");
       var page = $("#page").html(),
       subPage = replaceSpacesWithDashes($('#sub-page').html());


        var split = page.split("");
        page ="";
        for (var i = 3; i < split.length-1; i++) {
          page +=split[i];
        }
        page = replaceSpacesWithDashes(page);
        // console.log("tgt" + tgt);
        if (typeof(tgt) === 'string') {
          targetPage = tgt.replace(/^#/, '');
          // console.log('hi' + tgt);
        } else {
          var targetPage = location.hash.replace( /^#/, '' );
        }

        var pageChange = page != targetPage,
        subPageChange = subPage != targetPage;


        if ((pageChange || subPageChange) && !(!pageChange && subPageChange)) {
          $("#menu-option-"+targetPage).click();
          repressMenuClick = true;

        }
        //home page
        if (page==='' && subPage==='') {
          $("#menu-option-home").click();
        }

         // console.log("targetPage: "  + targetPage);
         localStorage.setItem('myhash', targetPage);
   };


      $(window).on('hashchange', correctHashChange);

  //display title over pic on hover
  $(".item-pic").hover(
    function() {
      var itemClass = this.classList[1];
      $("item-title.item-" + itemClass).css("display","block");
    },
    function() {
      $(".item-title").css("display","block");
    }
  );


  //empty out project info after exiting a project
  var emptyOutInfo = function() {
    new ProjectInfoView({model:""});
    $("#back").html("");

    // $("#more-info").css("max-height","100px");
    $("#more-info").css("background-color","var(--pageBackground)");
    // $("#see-more-button").html("");

     $("#non-project-description").html("");
  };

  //see more button expand functionality
  // $("#see-more-button").click(function(){
  //   if ($(this).html()==="see more"){
  //     $("#more-info").css("max-height","500px");
  //     $("#more-info").css("background-color","var(--subAccent)");
  //     $(this).html("see less");
  //   } else if ($(this).html()==="see less"){
  //     $(this).html("see more");
  //     $("#more-info").css("max-height","100px");
  //     $("#more-info").css("background-color","var(--pageBackground)");
  //   }
  // });
