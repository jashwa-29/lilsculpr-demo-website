(function ($) {
  "use strict";
/*=================================
    JS Index Here
==================================*/
/*
  01. On Load Function
  02. Preloader
  03. Mobile Menu Active
  04. Sticky fix
  05. Scroll To Top
  06. Set Background Image & Color & Mask
  07. Magnific Popup
  08. Section Positioning
  09. Filter
  10. Woocommerce All
  11. WOW Js (Scroll Animation)
  12. Custom Animaiton
  13. Popup Sidemenu
  14. Search Box Popup
  15. Counter Up
  16. Shape Mockupsass --watch assets/scss/style.scss:assets/css/style.css
  17. Tab Active Control
  18. Hero 2 Animation
  19. Button Hover
  00. Right Click Disable
  00. Inspect Element Disable
*/
/*=================================
    JS Index End
==================================*/
/*

/*---------- 01. On Load Function ----------*/
$(window).on('load', function () {
  $('.preloader').fadeOut();
  
});

/*---------- 02. Preloader ----------*/
if ($('.preloader').length > 0) {
  $('.preloaderCls').each(function () {
    $(this).on('click', function (e) {
      e.preventDefault();
      $('.preloader').css('display', 'none');
    })
  });
};


/*---------- 03. Mobile Menu Active ----------*/
$.fn.vsmobilemenu = function (options) {
  var opt = $.extend({
    menuToggleBtn: '.vs-menu-toggle',
    bodyToggleClass: 'vs-body-visible',
    subMenuClass: 'vs-submenu',
    subMenuParent: 'vs-item-has-children',
    subMenuParentToggle: 'vs-active',
    meanExpandClass: 'vs-mean-expand',
    subMenuToggleClass: 'vs-open',
    toggleSpeed: 400,
  }, options);

  return this.each(function () {
    var menu = $(this); // Select menu

    // Menu Show & Hide
    function menuToggle() {
      menu.toggleClass(opt.bodyToggleClass);

      // collapse submenu on menu hide or show
      var subMenu = '.' + opt.subMenuClass;
      $(subMenu).each(function () {
        if ($(this).hasClass(opt.subMenuToggleClass)) {
          $(this).removeClass(opt.subMenuToggleClass);
          $(this).css('display', 'none')
          $(this).parent().removeClass(opt.subMenuParentToggle);
        };
      });
    };

    // Class Set Up for every submenu
    menu.find('li').each(function () {
      var submenu = $(this).find('ul');
      submenu.addClass(opt.subMenuClass);
      submenu.css('display', 'none');
      submenu.parent().addClass(opt.subMenuParent);
      submenu.prev('a').addClass(opt.meanExpandClass);
      submenu.next('a').addClass(opt.meanExpandClass);
    });

    // Toggle Submenu 
    function toggleDropDown($element) {
      if ($($element).next('ul').length > 0) {
        $($element).parent().toggleClass(opt.subMenuParentToggle);
        $($element).next('ul').slideToggle(opt.toggleSpeed);
        $($element).next('ul').toggleClass(opt.subMenuToggleClass);
      } else if ($($element).prev('ul').length > 0) {
        $($element).parent().toggleClass(opt.subMenuParentToggle);
        $($element).prev('ul').slideToggle(opt.toggleSpeed);
        $($element).prev('ul').toggleClass(opt.subMenuToggleClass);
      };
    };

    // Submenu toggle Button
    var expandToggler = '.' + opt.meanExpandClass;
    $(expandToggler).each(function () {
      $(this).on('click', function (e) {
        e.preventDefault();
        toggleDropDown(this);
      });
    });

    // Menu Show & Hide On Toggle Btn click
    $(opt.menuToggleBtn).each(function () {
      $(this).on('click', function () {
        menuToggle();
      })
    })

    // Hide Menu On out side click
    menu.on('click', function (e) {
      e.stopPropagation();
      menuToggle()
    })

    // Stop Hide full menu on menu click
    menu.find('div').on('click', function (e) {
      e.stopPropagation();
    });

  });
};

$('.vs-menu-wrapper').vsmobilemenu();

/*---------- 04. Sticky fix ----------*/
  var lastScrollTop = '';
  var scrollToTopBtn = '.scrollToTop'

  function stickyMenu($targetMenu, $toggleClass, $parentClass) {
    var st = $(window).scrollTop();
    var height = $targetMenu.css('height');
    $targetMenu.parent().css('min-height', height);
    if ($(window).scrollTop() > 800) {
      $targetMenu.parent().addClass($parentClass);

      if (st > lastScrollTop) {
        $targetMenu.removeClass($toggleClass);
      } else {
        $targetMenu.addClass($toggleClass);
      };
    } else {
      $targetMenu.parent().css('min-height', '').removeClass($parentClass);
      $targetMenu.removeClass($toggleClass);
    };
    lastScrollTop = st;
  };
  $(window).on("scroll", function () {
    stickyMenu($('.sticky-active'), "active", "will-sticky");
    if ($(this).scrollTop() > 500) {
      $(scrollToTopBtn).addClass('show');
    } else {
      $(scrollToTopBtn).removeClass('show');
    }
  });

/*---------- 05. Scroll To Top ----------*/
$(scrollToTopBtn).each(function () {
  $(this).on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({
      scrollTop: 0
    }, lastScrollTop / 3);
    return false;
  });
})


 document.querySelector('.close-btn').addEventListener('click', function() {
            document.querySelector('.popup-container').classList.add('collapsed');
        });
        
        document.querySelector('.popup-tab').addEventListener('click', function() {
            document.querySelector('.popup-container').classList.remove('collapsed');
        });
        
        document.querySelector('.cta-button').addEventListener('click', function() {
            // alert('Redirecting to registration page...');
            // In a real implementation, this would be: window.location.href = 'register.html';
            window.location.href = 'special-offer-register.html';
        });


/*---------- 06. Set Background Image & Color & Mask ----------*/
if ($('[data-bg-src]').length > 0) {
  $('[data-bg-src]').each(function () {
    var src = $(this).attr('data-bg-src');
    $(this).css('background-image', 'url(' + src + ')');
    $(this).removeAttr('data-bg-src').addClass('background-image');
  });
};

if ($('[data-bg-color]').length > 0) {
  $('[data-bg-color]').each(function () {
    var color = $(this).attr('data-bg-color');
    $(this).css('background-color', color);
    $(this).removeAttr('data-bg-color');
  });
};

if ($('[data-mask-src]').length > 0) {
  $('[data-mask-src]').each(function () {
    var mask = $(this).attr('data-mask-src');
    $(this).css({
      'mask-image': 'url(' + mask + ')',
      '-webkit-mask-image': 'url(' + mask + ')'
    });
    $(this).removeAttr('data-mask-src');
  });
};

/*----------- 07. Magnific Popup ----------*/
/* magnificPopup img view */
$('.popup-image').magnificPopup({
  type: 'image',
  gallery: {
    enabled: true
  }
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
  type: 'iframe'
});


/*---------- 08. Section Positioning ----------*/
// Interger Converter
function convertInteger(str) {
  return parseInt(str, 10)
}

$.fn.sectionPosition = function (mainAttr, posAttr) {
  $(this).each(function () {
    var section = $(this);

    function setPosition() {
      var sectionHeight = Math.floor(section.height() / 2), // Main Height of section
        posData = section.attr(mainAttr), // where to position
        posFor = section.attr(posAttr), // On Which section is for positioning  
        topMark = 'top-half', // Pos top
        bottomMark = 'bottom-half', // Pos Bottom
        parentPT = convertInteger($(posFor).css('padding-top')), // Default Padding of  parent
        parentPB = convertInteger($(posFor).css('padding-bottom')); // Default Padding of  parent

      if (posData === topMark) {
        $(posFor).css('padding-bottom', parentPB + sectionHeight + 'px');
        section.css('margin-top', "-" + sectionHeight + 'px');
      } else if (posData === bottomMark) {
        $(posFor).css('padding-top', parentPT + sectionHeight + 'px');
        section.css('margin-bottom', "-" + sectionHeight + 'px');
      }
    }
    setPosition(); // Set Padding On Load
  })
}

var postionHandler = '[data-sec-pos]';
if ($(postionHandler).length) {
  $(postionHandler).imagesLoaded(function () {
    $(postionHandler).sectionPosition('data-sec-pos', 'data-pos-for');
  });
}

/*----------- 09. Filter ----------*/
$('.filter-active').imagesLoaded(function () {
  var $filter = '.filter-active',
    $filterItem = '.filter-item',
    $filterMenu = '.filter-menu-active';

  if ($($filter).length > 0) {
    var $grid = $($filter).isotope({
      itemSelector: $filterItem,
      filter: '*',
      /*
      // For masonary layout activation
      masonry: {
        // use outer width of grid-sizer for columnWidth
        columnWidth: 1
      }
      */
    });

    // filter items on button click
    $($filterMenu).on('click', 'button', function () {
      var filterValue = $(this).attr('data-filter');
      $grid.isotope({
        filter: filterValue
      });
    });

    // Menu Active Class 
    $($filterMenu).on('click', 'button', function (event) {
      event.preventDefault();
      $(this).addClass('active');
      $(this).siblings('.active').removeClass('active');
    });
  };
});

/*----------- 10. Woocommerce All ----------*/
// Ship To Different Address
$('#ship-to-different-address-checkbox').on('change', function () {
  if ($(this).is(':checked')) {
    $('#ship-to-different-address').next('.shipping_address').slideDown();
  } else {
    $('#ship-to-different-address').next('.shipping_address').slideUp();
  }
});

// Login Toggle
$('.woocommerce-form-login-toggle a').on('click', function (e) {
  e.preventDefault();
  $('.woocommerce-form-login').slideToggle();
})

// Coupon Toggle
$('.woocommerce-form-coupon-toggle a').on('click', function (e) {
  e.preventDefault();
  $('.woocommerce-form-coupon').slideToggle();
})

// Woocommerce Shipping Method
$('.shipping-calculator-button').on('click', function (e) {
  e.preventDefault();
  $(this).next('.shipping-calculator-form').slideToggle();
})

// Woocommerce Payment Toggle
$('.wc_payment_methods input[type="radio"]:checked').siblings('.payment_box').show();
$('.wc_payment_methods input[type="radio"]').each(function () {
  $(this).on('change', function () {
    $('.payment_box').slideUp();
    $(this).siblings('.payment_box').slideDown();
  })
})

// Woocommerce Rating Toggle
$('.rating-select .stars a').each(function () {
  $(this).on('click', function (e) {
    e.preventDefault();
    $(this).siblings().removeClass('active');
    $(this).parent().parent().addClass('selected');
    $(this).addClass('active');
  });
})

// Quantity

$('.quantity-plus').each(function () {
  $(this).on('click', function (e) {
    e.preventDefault();
    var $qty = $(this).siblings(".qty-input");
    var currentVal = parseInt($qty.val());
    if (!isNaN(currentVal)) {
      $qty.val(currentVal + 1);
    }
  })
});

$('.quantity-minus').each(function () {
  $(this).on('click', function (e) {
    e.preventDefault();
    var $qty = $(this).siblings(".qty-input");
    var currentVal = parseInt($qty.val());
    if (!isNaN(currentVal) && currentVal > 1) {
      $qty.val(currentVal - 1);
    }
  });
})

// Cart Show 
$('.cart-button').on('click', function (e) {
  e.preventDefault();
  $(this).toggleClass('active');
  $('.shopping-cart-wrapper').toggleClass('show');
});

// On click img source change
$(".product-thumb").length &&
$(".product-thumb").each(function () {
    $(this).on("click", function () {
        var t = $(this).find("img").data("big-img");
        $(".img-fullsize img").attr("src", t), $(".img-fullsize .popup-image").attr("href", t);
    });
}),

$(".price_slider").slider({
  range: true,
  min: 10,
  max: 100,
  values: [10, 75],
  slide: function (event, ui) {
    $(".from").text("$" + ui.values[0]);
    $(".to").text("$" + ui.values[1]);
  }
});
$(".from").text("$" + $(".price_slider").slider("values", 0));
$(".to").text("$" + $(".price_slider").slider("values", 1));

// Indicator
$.fn.indicator = function () {
  var $menu = $(this),
    $linkBtn = $menu.find('a'),
    $btn = $menu.find('button');
  // Append indicator
  $menu.append('<span class="indicator"></span>');
  var $line = $menu.find('.indicator');
  // Check which type button is Available
  if ($linkBtn.length) {
    var $currentBtn = $linkBtn;
  } else if ($btn.length) {
    var $currentBtn = $btn
  }
  // On Click Button Class Remove
  $currentBtn.on('click', function (e) {
    e.preventDefault();
    $(this).addClass('active');
    $(this).siblings('.active').removeClass('active');
    linePos()
  })
  // Indicator Position
  function linePos() {
    var $btnActive = $menu.find('.active'),
      $height = $btnActive.css('height'),
      $width = $btnActive.css('width'),
      $top = $btnActive.position().top + 'px',
      $left = $btnActive.position().left + 'px';
    $line.css({
      top: $top,
      left: $left,
      width: $width,
      height: $height,
    })
  }

  // if ($menu.hasClass('vs-slider-tab')) {
  //   var linkslide = $menu.data('asnavfor');
  //   $(linkslide).on('afterChange', function (event, slick, currentSlide, nextSlide) {
  //     setTimeout(linePos, 10)
  //   });
  // }
  linePos()
}

// Call On Load
if ($('.filter-menu').length) {
  $('.filter-menu').indicator();
}

if ($('.product-tab-style1').length) {
  $('.product-tab-style1').indicator();
}

if ($('.choose-tab').length) {
  $('.choose-tab').indicator();
}

  /*----------- 11. WOW Js (Scroll Animation) ----------*/
  new WOW().init();

  /*----------- 12. Custom Animaiton ----------*/
  $('[data-ani-duration]').each(function () {
    var durationTime = $(this).data('ani-duration');
    $(this).css('animation-duration', durationTime);
  });
  
  $('[data-ani-delay]').each(function () {
    var delayTime = $(this).data('ani-delay');
    $(this).css('animation-delay', delayTime);
  });
  
  $('[data-ani]').each(function () {
    var animaionName = $(this).data('ani');
    $(this).addClass(animaionName);
    $('.slick-current [data-ani]').addClass('vs-animated');
  });
  
  $('.vs-carousel').on('afterChange', function (event, slick, currentSlide, nextSlide) {
    $(slick.$slides).find('[data-ani]').removeClass('vs-animated');
    $(slick.$slides[currentSlide]).find('[data-ani]').addClass('vs-animated');
  })

/*---------- 13. Popup Sidemenu ----------*/
function popupSideMenu($sideMenu, $sideMunuOpen, $sideMenuCls, $toggleCls) {
  // Sidebar Popup
  $($sideMunuOpen).on('click', function (e) {
    e.preventDefault();
    $($sideMenu).addClass($toggleCls);
  });
  $($sideMenu).on('click', function (e) {
    e.stopPropagation();
    $($sideMenu).removeClass($toggleCls)
  });
  var sideMenuChild = $sideMenu + ' > div';
  $(sideMenuChild).on('click', function (e) {
    e.stopPropagation();
    $($sideMenu).addClass($toggleCls)
  });
  $($sideMenuCls).on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $($sideMenu).removeClass($toggleCls);
  });
};
popupSideMenu('.sidemenu-wrapper', '.sideMenuToggler', '.sideMenuCls', 'show');



/*---------- 14. Search Box Popup ----------*/
function popupSarchBox($searchBox, $searchOpen, $searchCls, $toggleCls) {
  $($searchOpen).on('click', function (e) {
    e.preventDefault();
    $($searchBox).addClass($toggleCls);
  });
  $($searchBox).on('click', function (e) {
    e.stopPropagation();
    $($searchBox).removeClass($toggleCls);
  });
  $($searchBox).find('form').on('click', function (e) {
    e.stopPropagation();
    $($searchBox).addClass($toggleCls);
  });
  $($searchCls).on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $($searchBox).removeClass($toggleCls);
  });
};
popupSarchBox('.popup-search-box', '.searchBoxToggler', '.searchClose', 'show');

/*----------- 15. Counter Up ----------*/
$('.counter-number').counterUp({
  delay: 10,
  time: 1000
});

/*----------- 16. Shape Mockup ----------*/
$.fn.shapeMockup = function () {
  var $shape = $(this);
  $shape.each(function() {
    var $currentShape = $(this),
    shapeTop = $currentShape.data('top'),
    shapeRight = $currentShape.data('right'),
    shapeBottom = $currentShape.data('bottom'),
    shapeLeft = $currentShape.data('left');
    $currentShape.css({
      top: shapeTop,
      right: shapeRight,
      bottom: shapeBottom,
      left: shapeLeft,
    }).removeAttr('data-top')
    .removeAttr('data-right')
    .removeAttr('data-bottom')
    .removeAttr('data-left')
    .parent().addClass('shape-mockup-wrap');
  });
};

if ($('.shape-mockup')) {
  $('.shape-mockup').shapeMockup();
}

/* ---------- 17. Tab Active Control ------------- */

if ($('#service-tab1').length > 0) {
  $('#service-tab1 button').on('click', function () {
    $('#service-tab2 button').removeClass('active');
  })
};

if ($('#service-tab2').length > 0) {
  $('#service-tab2 button').on('click', function () {
    $('#service-tab1 button').removeClass('active');
  })
};

/*---------- 18. Hero 2 Animation ----------*/
if ($('.hero-2').length > 0) {
  window.addEventListener('scroll', function() {
    let value = window.scrollY;
    $('#fire').css('transform', "translate(" + value * 0.2 + 'px' + "," + value * 0.2 + 'px' + ")");
    $('#rocket').css('transform', "translate(" + value * 0.25 + 'px' + "," + value * -0.25 + 'px' + ")");
    $('#cloud').css('transform', "translate(" + "0" + "," + value * 0.35 + 'px' + ")");
    $('#emoji').css('transform', "translate(" + value * 0.25 + 'px' + "," + 0 + ")");
    $('#cloud2').css('transform', "translate(" + value * -0.25 + 'px' + "," + 0 + ")");
    // fire.style.transform = "translate(" + value * 0.2 + 'px' + "," + value * 0.2 + 'px' + ")";
  })
};

if ($(".parallax").length > 0) {
  var scene = $(".parallax").get(0);
  var parallax = new Parallax(scene, {
    relativeInput: false,
    hoverOnly: true,
  });
};








/*----------- 19. Button Hover ----------*/
var btnHover = $("<span class='btn-hover'><span class='btn-hover-inner'><span class='part part-1'></span><span class='part part-1'></span><span class='part part-1'></span><span class='part part-1'></span></span></span>");
$('.wave-btn').append(btnHover);



/*----------- 00. Right Click Disable ----------*/
  // window.addEventListener('contextmenu', function (e) {
  //   // do something here... 
  //   e.preventDefault();
  // }, false);


  /*----------- 00. Inspect Element Disable ----------*/
  // document.onkeydown = function (e) {
  //   if (event.keyCode == 123) {
  //     return false;
  //   }
  //   if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
  //     return false;
  //   }
  //   if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
  //     return false;
  //   }
  //   if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
  //     return false;
  //   }
  //   if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
  //     return false;
  //   }
  // }



})(jQuery);

 