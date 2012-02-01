=ExtJS Theming Utility=
This tool was created using *ExtJS 4.0.7*.  To run the tool you'll need
the ext-all.js file as well as the ext-all-gray.css file along with the
gray theme images folder.  Your folder structure should be:

  * ext-4.0.7
    * resources
      * css
        * ext-all-gray.css
      * themes
        * images
          * gray
    * ext-all.js
  * index.html
  * sasstool.js

This utility provides several tools to manipulate css colors or calculate
color values based on the scss adjust() function.  These tools will help
when generating new themes using the Sencha provided scss files.  Since
the Sencha theme uses many images and the default for these images is
blue, I have elected to use the gray theme as default. This gives a better
preview when changing the base color since the neutral gray images are used
instead of the default blue images.

Note: Tested in Chrome 16, Firefox 9, and Safari 5.  Not tested in IE9.
Don't bother running in IE8 or earlier.

The "Base Color" panel allows you to select a new base color.  The tool will
then calculate how your theme would look if you used this new base color
to compile a new css file (using all the base scss files provided by Sencha).
Click the View Examples button to pop up a window with additional Ext 
components with the new css styling applied.  Click on the reset button to
revert back to the default theme.  There is also a randomize button to 
generate a random color.

The "Color Adjustment" panel allows you to calculate a new color based on
changes to the hue, saturation, and lightness.  This way you are able to
see what the resulting color would be when your scss is compiled.

The "Variations" panel will show some colors with different variations
based on the base color.  There are 3 different panels that each apply
some pre-set hue, saturation, or brightness adjustments and then display
the resulting color.  Each suggested color is clickable and will become
the new base color when clicked.