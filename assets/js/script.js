
$(function() 
{
    // Navbar mobile selectiony thing
    $("nav a.nav-accordion").click(function() {
        $(this).toggleClass("active")
        $("nav ul").toggleClass("active")

        if (window.scrollY === 0)
            $("nav").toggleClass("top")
    })

    // Navbar resize reset
    $(window).resize(function() {
        if (window.innerWidth > 640) {
            $("nav a.nav-accordion").removeClass("active")
            $("nav ul").removeClass("active")

            if (window.scrollY === 0)
                $("nav").addClass("top")
        }
    });

    // Navbar top colorize
    $(window).scroll(function() {
        (window.scrollY === 0) ? $("nav").addClass("top") : $("nav").removeClass("top")
    })

    // Do it on launch
    (window.scrollY === 0) ? $("nav").addClass("top") : $("nav").removeClass("top")    
})
