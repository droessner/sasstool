/**
 * @author Danny Roessner <droessne@gmail.com>
 * http://code.google.com/p/extjs-sass-tool/
 *
 * This tool was created using ExtJS 4.0.7.  To run the tool you'll need
 * the ext-all.js file as well as the ext-all-gray.css file along with the
 * gray theme images folder.  Your folder structure should be:
 *
 * - ext-4.0.7
 *   - resources
 *     - css
 *       - ext-all-gray.css
 *     - themes
 *       - images
           - gray
 *   - ext-all.js
 * - index.html
 * - sasstool.js
 *
 *
 * This utility provides several tools to manipulate css colors or calculate
 * color values based on the scss adjust() function.  These tools will help
 * when generating new themes using the Sencha provided scss files.  Since
 * the Sencha theme uses many images and the default for these images is
 * blue, I have elected to use the gray theme as default. This gives a better
 * preview when changing the base color since the neutral gray images are used
 * instead of the default blue images.
 *
 * Note: Tested in Chrome 16, Firefox 9, and Safari 5.  Not tested in IE9.
 * Don't bother running in IE8 or earlier.
 *
 * The "Base Color" panel allows you to select a new base color.  The tool will
 * then calculate how your theme would look if you used this new base color
 * to compile a new css file (using all the base scss files provided by Sencha).
 * Click the View Examples button to pop up a window with additional Ext 
 * components with the new css styling applied.  Click on the reset button to
 * revert back to the default theme.  There is also a randomize button to 
 * generate a random color.
 *
 * The "Color Adjustment" panel allows you to calculate a new color based on
 * changes to the hue, saturation, and lightness.  This way you are able to
 * see what the resulting color would be when your scss is compiled.
 *
 * The "Variations" panel will show some colors with different variations
 * based on the base color.  There are 3 different panels that each apply
 * some pre-set hue, saturation, or brightness adjustments and then display
 * the resulting color.  Each suggested color is clickable and will become
 * the new base color when clicked.
 */
Ext.onReady(function () {
    var hexToRgb,
        colorToHex,
        rgbToHex,
        panel,
        sampleWindow,
        rgbToHsl,
        hslToRgb;

    hexToRgb = function (hex) {
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    };

    colorToHex = function (color) {
        color = Ext.Number.constrain(parseInt(color, 10), 0, 255);
        return '0123456789ABCDEF'.charAt((color - color % 16) / 16) + '0123456789ABCDEF'.charAt(color % 16);
    };

    rgbToHex = function (r, g, b) {
        return colorToHex(r) + colorToHex(g) + colorToHex(b);
    };

    rgbToHsl = function (r, g, b) {
        var max = Math.max(r, g, b),
            range = max - Math.min(r, g, b),
            l = (max / 255) - (range / 510),
            h = (range === 0 ? 0 : (max === r ? ((g - b) / range * 60) : (max === g ? ((b - r) / range * 60 + 120) : (max === b ? ((r - g) / range * 60 + 240) : 0))));

        return {
            h: h < 0 ? h + 360 :  h,
            s: (range === 0 ? 0 : (range / 2.55) / (l < 0.5 ? (l * 2) : (2 - (l * 2)))),
            l: l * 100
        };
    };

    hslToRgb = function (h, s, l) {
        var rgb = [],
            value,
            temp1,
            temp2;

        h = (h % 360 + 360) % 360;
        s = Ext.Number.constrain(s, 0, 100);
        l = Ext.Number.constrain(l, 0, 100);

        if (s === 0) {
            value = l * 2.55;
            return {
                r: value,
                g: value,
                b: value
            };
        } else {
            rgb = [
                (h + 120) / 60 % 6,
                (h / 60),
                (h + 240) / 60 % 6
            ];

            temp1 = l < 50 ? (l * (1 + s / 100)) : (l + s - l * s / 100);
            temp2 = 2 * l - temp1;

            Ext.Array.forEach(rgb, function (item, index) {
				rgb[index] = 2.55 * (item < 1 ? (temp2 + (temp1 - temp2) * item) : (item < 3 ? (temp1) : (item < 4 ? (temp2 + (temp1 - temp2) * (4 - item)) : (temp2))));
            });

            return {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2]
            };
        }
    };

    panel = Ext.create('Ext.panel.Panel', {
        border: false,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        title: 'ExtJS Sass Color Utility',
        calculate: function () {
            var color = panel.down('#start').getValue(),
                startRGB,
                hue,
                saturation,
                brightness,
                hslValues,
                endRGB,
                endColor;

            if (!panel.down('#start').isValid() || !panel.down('#hue').isValid() || !panel.down('#saturation').isValid() || !panel.down('#brightness').isValid()) {
                return;
            }

            color = color.toUpperCase();

            startRGB = hexToRgb(color);
            hue = parseFloat(panel.down('#hue').getValue());
            saturation = parseFloat(panel.down('#saturation').getValue());
            brightness = parseFloat(panel.down('#brightness').getValue());

            panel.down('#startPanel').body.setStyle({
                'background-color': '#' + color
            });

            hslValues = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);
            endRGB = hslToRgb(hslValues.h + hue, hslValues.s + saturation, hslValues.l + brightness);
            endColor = rgbToHex(endRGB.r, endRGB.g, endRGB.b);
            panel.down('#end').setValue('#' + endColor);
            panel.down('#adjustmentPanel').body.setStyle({
                'background-color': '#' + endColor
            });
			panel.suggest();
        },
        suggest: function () {
            var start = panel.down('#start'),
			    color = start.getValue(),
                startRGB,
                endRGB,
                hslValues,
                endColor,
                suggestItems = [],
                setFunction,
				textValue,
                i;

            if (!start.isValid()) {
                return;
            }

			setFunction = function (c) {
                var el = c.getEl();

                el.on('click', function () {
                    start.setValue(c.color);
                    start.setColor();
                    panel.showExample(false);
                });
            };

            color = color.toUpperCase();
            startRGB = hexToRgb(color);
            hslValues = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

            for (i = 30; i <= 120; i += 30) {
                endRGB = hslToRgb(hslValues.h + i, hslValues.s, hslValues.l);
                endColor = rgbToHex(endRGB.r, endRGB.g, endRGB.b);

				if (i === 30) {
					textValue = ' (Anologous)';
				} else if (i === 60) {
					textValue = '';
				} else if (i === 90) {
					textValue = '';
				} else if (i === 120) {
					textValue = ' (Triadic)';
				}
                suggestItems.push({
                    xtype: 'container',
                    width: 200,
                    height: 20,
                    color: endColor,
                    saturation: i,
                    red: endRGB.r,
                    green: endRGB.g,
                    blue: endRGB.b,
                    html: '#' + endColor + textValue,
                    style: {
                        'background-color': '#' + endColor,
                        cursor: 'pointer'
                    },
                    listeners: {
                        afterrender: setFunction
                    }
                });
			}

			for (i = -210; i <= -30; i += 30) {
                endRGB = hslToRgb(hslValues.h + i, hslValues.s, hslValues.l);
                endColor = rgbToHex(endRGB.r, endRGB.g, endRGB.b);

				if (i === -210) {
					textValue = ' (Split Complementary)';
				} else if (i === -180) {
					textValue = ' (Complementary)';
				} else if (i === -150) {
					textValue = ' (Split Complementary)';
				} else if (i === -120) {
					textValue = ' (Triadic)';
				} else if (i === -90) {
					textValue = '';
				} else if (i === -60) {
					textValue = '';
				} else if (i === -30) {
					textValue = ' (Anologous)';
				}
                suggestItems.push({
                    xtype: 'container',
                    width: 200,
                    height: 20,
                    color: endColor,
                    saturation: i,
                    red: endRGB.r,
                    green: endRGB.g,
                    blue: endRGB.b,
                    html: '#' + endColor + textValue,
                    style: {
                        'background-color': '#' + endColor,
                        cursor: 'pointer'
                    },
                    listeners: {
                        afterrender: setFunction
                    }
                });
			}

            panel.down('#hueSuggestions').removeAll();
            panel.down('#hueSuggestions').add(suggestItems);

            suggestItems = [];

            for (i = -50; i <= 50; i += 10) {
                endRGB = hslToRgb(hslValues.h, hslValues.s + i, hslValues.l);
                endColor = rgbToHex(endRGB.r, endRGB.g, endRGB.b);

                suggestItems.push({
                    xtype: 'container',
                    width: 60,
                    height: 20,
                    color: endColor,
                    brightness: i,
                    red: endRGB.r,
                    green: endRGB.g,
                    blue: endRGB.b,
                    html: '#' + endColor,
                    style: {
                        'background-color': '#' + endColor,
                        cursor: 'pointer'
                    },
                    listeners: {
                        afterrender: setFunction
                    }
                });
            }

			panel.down('#saturationSuggestions').removeAll();
            panel.down('#saturationSuggestions').add(suggestItems);

			suggestItems = [];

			for (i = -20; i <= 20; i += 4) {
                endRGB = hslToRgb(hslValues.h, hslValues.s, hslValues.l + i);
                endColor = rgbToHex(endRGB.r, endRGB.g, endRGB.b);

                suggestItems.push({
                    xtype: 'container',
                    width: 60,
                    height: 20,
                    color: endColor,
                    brightness: i,
                    red: endRGB.r,
                    green: endRGB.g,
                    blue: endRGB.b,
                    html: '#' + endColor,
                    style: {
                        'background-color': '#' + endColor,
                        cursor: 'pointer'
                    },
                    listeners: {
                        afterrender: setFunction
                    }
                });
            }

            panel.down('#brightnessSuggestions').removeAll();
            panel.down('#brightnessSuggestions').add(suggestItems);
        },
        adjustColor: function (color, hue, saturation, brightness) {
            var startRGB,
                hslValues,
                endRGB,
                endColor;

            startRGB = hexToRgb(color);
            hslValues = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);
            endRGB = hslToRgb(hslValues.h + hue, hslValues.s + saturation, hslValues.l + brightness);
            endColor = rgbToHex(endRGB.r, endRGB.g, endRGB.b);

            return '#' + endColor;
        },
        showExample: function (showWindow) {
            var color = panel.down('#start').getValue(),
                adjust = panel.adjustColor,
                css,
                ecf2fb,
                e4f3ff,
                b6cbe4,
                d9edff,
                c2d8f2,
                c6dcf6,
                bfd2e6,
                c8dc0f5,
                c98c5f5,
                c99bce8,
                dfe8f6,
                dbeeff,
                d0e7ff,
                bbd2f0,
                bed6f5,
                bccfe5,
                c5d6e7,
                c95c4f4,
                c9fc9f5,
                d3e1f1,
                dfe9f5,
                cbddf3,
                dae7f6,
                cddef3,
                abc7ec,
                b8cfee,
                f4f8fd,
                d9e7f8,
                f3f7fb,
                c04408c,
                dfe9f6,
                a3bad9,
                d9e8fb,
                e7f0fc,
                c7ddf9,
                ebf3fd,
                aaccf6,
                a3bae9,
                deecfd,
                f5f9fe,
                dde8f5,
                cbdbef,
                d6e6fa,
                ccdef6,
                cbdaee,
                c7d8ed,
                d1dff0,
                dee8f5,
                dfecfb,
                b2d1f5,
                edf4fd,
                cde1f9,
                c264888,
                c1f3a6c,
                ddecfe,
                c15428b;

            if (!panel.down('#start').isValid()) {
                return;
            }

            // Generate the new css style rules and create the stylesheet
            ecf2fb = adjust(color, 0, 6.5, 11.25);
            e4f3ff = adjust(color, -6.667, 44.444, 10.588);
            b6cbe4 = adjust(color, -0.725, -9.556, -3.725);
            d9edff = adjust(color, -6, 42, 8.25);
            c2d8f2 = adjust(color, -1, 8.5, 1.25);
            c6dcf6 = adjust(color, -1, 16.5, 3);
            bfd2e6 = adjust(color, -4, -12.25, -1.75);
            c8dc0f5 = adjust(color, -3, 27.75, -8.5);
            c98c5f5 = adjust(color, -2, 26.25, -6.25);
            c99bce8 = adjust(color, 0, 7.644, -8.627);
            dfe8f6 = adjust(color, 3.188, 0.542, 7.843);
            dbeeff = adjust(color, -6, 41.75, 8.75);
            d0e7ff = adjust(color, -3, 42.5, 6.5);
            bbd2f0 = adjust(color, 0, 7.5, -0.5);
            bed6f5 = adjust(color, 0, 17, 1);
            bccfe5 = adjust(color, -2, -12, -2.5);
            c5d6e7 = adjust(color, -4, -15, -0.25);
            c95c4f4 = adjust(color, -3, 25.25, -7);
            c9fc9f5 = adjust(color, -3, 24.75, -5);
            d3e1f1 = adjust(color, -2, -5.5, 4.5);
            dfe9f5 = adjust(color, -2, -4.5, 7.5);
            cbddf3 = adjust(color, -1, 5.75, 3.25);
            dae7f6 = adjust(color, -2, 3.75, 6.75);
            cddef3 = adjust(color, 0, 4.5, 3.75);
            abc7ec = adjust(color, 0, 7, -4.5);
            b8cfee = adjust(color, 1, 5, -1.5);
            f4f8fd = adjust(color, -4, 7.25, 13.25);
            d9e7f8 = adjust(color, -1, 11.5, 7);
            f3f7fb = adjust(color, -7, -11.5, 12.75);
            c04408c = adjust(dfe8f6.substring(1), 0, 38.347, -63.725);
            dfe9f6 = adjust(color, -1, -1.25, 7.75);
            a3bad9 = adjust(color, 1, -14.25, -9.75);
            d9e8fb = adjust(color, -1, 23.5, 7.5);
            e7f0fc = adjust(color, -1, 19, 10.5);
            c7ddf9 = adjust(color, 0, 24, 3.75);
            ebf3fd = adjust(color, -2, 22.25, 11.5);
            aaccf6 = adjust(color, 0, 24.75, -2.5);
            a3bae9 = adjust(color, 7, 5.25, -6.5);
            deecfd = adjust(color, -1, 30.25, 9);
            f5f9fe = adjust(color, -2, 19.25, 13.75);
            dde8f5 = adjust(color, -2, -3.25, 7.25);
            cbdbef = adjust(color, -1, -3.75, 2.5);
            d6e6fa = adjust(color, -1, 21, 6.75);
            ccdef6 = adjust(color, 0, 13.25, 4);
            cbdaee = adjust(color, 0, -5.75, 2.25);
            c7d8ed = adjust(color, -1, -5, 1.25);
            d1dff0 = adjust(color, -2, -5.5, 3.75);
            dee8f5 = adjust(color, 0, -3.5, 7.5);
            dfecfb = adjust(color, -2, 19.75, 8.75);
            b2d1f5 = adjust(color, -1, 20.5, -1.25);
            edf4fd = adjust(color, -1, 22.5, 12);
            cde1f9 = adjust(color, -1, 21.75, 4.75);
            c264888 = adjust(color, 6, 0.25, -50);
            c1f3a6c = adjust(color, 5, 0, -57);
            ddecfe = adjust(color, -1, 36, 9);
            c15428b = adjust(color, 4, 17.75, -52.75);
            css = [
                '.x-window-default {',
                '    border-color: ' + adjust(color, 0.952, -32.377, -13.725) + ';', //#a2b1c5
                '    -moz-box-shadow: ' + ecf2fb + ' 0 1px 0px 0 inset, ' + ecf2fb + ' 0 -1px 0px 0 inset, ' + ecf2fb + ' -1px 0 0px 0 inset, ' + ecf2fb + ' 1px 0 0px 0 inset;',
                '    -webkit-box-shadow: ' + ecf2fb + ' 0 1px 0px 0 inset, ' + ecf2fb + ' 0 -1px 0px 0 inset, ' + ecf2fb + ' -1px 0 0px 0 inset, ' + ecf2fb + ' 1px 0 0px 0 inset;',
                '    -o-box-shadow: ' + ecf2fb + ' 0 1px 0px 0 inset, ' + ecf2fb + ' 0 -1px 0px 0 inset, ' + ecf2fb + ' -1px 0 0px 0 inset, ' + ecf2fb + ' 1px 0 0px 0 inset;',
                '    box-shadow: ' + ecf2fb + ' 0 1px 0px 0 inset, ' + ecf2fb + ' 0 -1px 0px 0 inset, ' + ecf2fb + ' -1px 0 0px 0 inset, ' + ecf2fb + ' 1px 0 0px 0 inset',
                '}',
                '',
                '.x-window-default {',
                '    background-color: ' + adjust(color, 0.267, -21.309, 1.569), //#ced9e7
                '}',
                '.x-window-header-default-top {',
                '    background-color: ' + adjust(color, 0.267, -21.309, 1.569), //#ced9e7
                '}',
                '.x-window-body-default {',
                '    border-color: ' + adjust(color, 0.844, 7.644, -8.627) + ';', //#99bbe8
                '    background: ' + dfe8f6 + ';', //#dfe8f6
                '}',
                '',
                '.x-window-header-default {',
                '    border-color: ' + adjust(color, 0.844, 7.644, -8.627) + ';', //#a2b1c5
                '}',
                '',
                '.x-window-header-text-default {',
                '    color: ' + adjust(color, -2.451, 38.889, -55.882) + ';', //#04468c
                '}',
                '.x-btn-default-small-over {',
                '    border-color: ' + adjust(color, 1, 15.25, -2.25) + ';', //#b0ccf2
                '    background-color: ' + e4f3ff + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + e4f3ff + '), color-stop(48%, ' + d9edff + '), color-stop(52%, ' + c2d8f2 + '), color-stop(100%, ' + c6dcf6 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + e4f3ff + ', ' + d9edff + ' 48%,' + c2d8f2 + ' 52%,' + c6dcf6 + ');',
                '    background-image: -moz-linear-gradient(top, ' + e4f3ff + ',' + d9edff + ' 48%,' + c2d8f2 + ' 52%,' + c6dcf6 + ');',
                '    background-image: -o-linear-gradient(top, ' + e4f3ff + ',' + d9edff + ' 48%,' + c2d8f2 + ' 52%,' + c6dcf6 + ');',
                '    background-image: -ms-linear-gradient(top, ' + e4f3ff + ',' + d9edff + ' 48%,' + c2d8f2 + ' 52%,' + c6dcf6 + ');',
                '    background-image: linear-gradient(top, ' + e4f3ff + ',' + d9edff + ' 48%,' + c2d8f2 + ' 52%,' + c6dcf6 + ')',
                '}',
                '',
                '.x-btn-default-small-menu-active,.x-btn-default-small-pressed {',
                '    border-color: ' + adjust(b6cbe4.substring(1), 2.317, 6.756, -5.294) + ';', //#9ebae1
                '    background-color: ' + b6cbe4 + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + b6cbe4 + '), color-stop(48%, ' + bfd2e6 + '), color-stop(52%, ' + c8dc0f5 + '), color-stop(100%, ' + c98c5f5 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + b6cbe4 + ',' + bfd2e6 + ' 48%,' + c8dc0f5 + ' 52%,' + c98c5f5 + ');',
                '    background-image: -moz-linear-gradient(top, ' + b6cbe4 + ',' + bfd2e6 + ' 48%,' + c8dc0f5 + ' 52%,' + c98c5f5 + ');',
                '    background-image: -o-linear-gradient(top, ' + b6cbe4 + ',' + bfd2e6 + ' 48%,' + c8dc0f5 + ' 52%,' + c98c5f5 + ');',
                '    background-image: -ms-linear-gradient(top, ' + b6cbe4 + ',' + bfd2e6 + ' 48%,' + c8dc0f5 + ' 52%,' + c98c5f5 + ');',
                '    background-image: linear-gradient(top, ' + b6cbe4 + ',' + bfd2e6 + ' 48%,' + c8dc0f5 + ' 52%,' + c98c5f5 + ')',
                '}',
                '',
                '.x-btn-default-toolbar-small-over {',
                '    border-color: ' + adjust(color, 0, -10.25, -18) + ';', //#81a4d0
                '    background-color: ' + dbeeff + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + dbeeff + '), color-stop(48%, ' + d0e7ff + '), color-stop(52%, ' + bbd2f0 + '), color-stop(100%, ' + bed6f5 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + dbeeff + ',' + d0e7ff + ' 48%,' + bbd2f0 + ' 52%,' + bed6f5 + ');',
                '    background-image: -moz-linear-gradient(top, ' + dbeeff + ',' + d0e7ff + ' 48%,' + bbd2f0 + ' 52%,' + bed6f5 + ');',
                '    background-image: -o-linear-gradient(top, ' + dbeeff + ',' + d0e7ff + ' 48%,' + bbd2f0 + ' 52%,' + bed6f5 + ');',
                '    background-image: -ms-linear-gradient(top, ' + dbeeff + ',' + d0e7ff + '48%,' + bbd2f0 + ' 52%,' + bed6f5 + ');',
                '    background-image: linear-gradient(top, ' + dbeeff + ',' + d0e7ff + ' 48%,' + bbd2f0 + ' 52%,' + bed6f5 + ')',
                '}',
                '.x-btn-default-toolbar-small-menu-active,.x-btn-default-toolbar-small-pressed {',
                '    border-color: ' + adjust(color, 1, -17.25, -21.75) + ';', //#7a9ac4
                '    background-color: ' + bccfe5 + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + bccfe5 + '), color-stop(48%, ' + c5d6e7 + '), color-stop(52%, ' + c95c4f4 + '), color-stop(100%, ' + c9fc9f5 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + bccfe5 + ',' + c5d6e7 + ' 48%,' + c95c4f4 + ' 52%,' + c9fc9f5 + ');',
                '    background-image: -moz-linear-gradient(top, ' + bccfe5 + ',' + c5d6e7 + ' 48%,' + c95c4f4 + ' 52%,' + c9fc9f5 + ');',
                '    background-image: -o-linear-gradient(top, ' + bccfe5 + ',' + c5d6e7 + ' 48%,' + c95c4f4 + ' 52%,' + c9fc9f5 + ');',
                '    background-image: -ms-linear-gradient(top, ' + bccfe5 + ',' + c5d6e7 + ' 48%,' + c95c4f4 + ' 52%,' + c9fc9f5 + ');',
                '    background-image: linear-gradient(top, ' + bccfe5 + ',' + c5d6e7 + ' 48%,' + c95c4f4 + ' 52%,' + c9fc9f5 + ')',
                '}',
                '.x-toolbar-default {',
                '    border-color: ' + c99bce8 + ';',
                '    background-color: ' + d3e1f1 + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + dfe9f5 + '), color-stop(100%, ' + d3e1f1 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + dfe9f5 + ',' + d3e1f1 + ');',
                '    background-image: -moz-linear-gradient(top, ' + dfe9f5 + ',' + d3e1f1 + ');',
                '    background-image: -o-linear-gradient(top, ' + dfe9f5 + ',' + d3e1f1 + ');',
                '    background-image: -ms-linear-gradient(top, ' + dfe9f5 + ',' + d3e1f1 + ');',
                '    background-image: linear-gradient(top, ' + dfe9f5 + ',' + d3e1f1 + ')',
                '}',
                '.x-panel-default {',
                '    border-color: ' + c99bce8,
                '}',
                '.x-panel-header-default {',
                '    border-color: ' + c99bce8 + ';',
                '    background-color: ' + cbddf3 + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + dae7f6 + '), color-stop(45%, ' + cddef3 + '), color-stop(46%, ' + abc7ec + '), color-stop(50%, ' + abc7ec + '), color-stop(51%, ' + b8cfee + '), color-stop(100%, ' + cbddf3 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + dae7f6 + ', ' + cddef3 + ' 45%, ' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -moz-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -o-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -ms-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%, ' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    -moz-box-shadow: ' + f4f8fd + ' 0 1px 0px 0 inset;',
                '    -webkit-box-shadow: ' + f4f8fd + ' 0 1px 0px 0 inset;',
                '    -o-box-shadow: ' + f4f8fd + ' 0 1px 0px 0 inset;',
                '    box-shadow: ' + f4f8fd + ' 0 1px 0px 0 inset',
                '}',
                '.x-panel-header-text-default {',
                '    color: ' + c04408c + ';',
                '}',
                '',
                '.x-panel-body-default {',
                '    border-color: ' + c99bce8 + ';',
                '}',
                '.x-accordion-hd {',
                '    background: ' + d9e7f8 + ' !important;',
                '    -moz-box-shadow: inset 0 0 0 0 ' + d9e7f8 + ';',
                '    -webkit-box-shadow: inset 0 0 0 0 ' + d9e7f8 + ';',
                '    -o-box-shadow: inset 0 0 0 0 ' + d9e7f8 + ';',
                '    box-shadow: inset 0 0 0 0 ' + d9e7f8,
                '}',
                '.x-accordion-hd-sibling-expanded {',
                '    border-top-color: ' + c99bce8 + ' !important;',
                '    -moz-box-shadow: inset 0 1px 0 0 ' + f3f7fb + ';',
                '    -webkit-box-shadow: inset 0 1px 0 0 ' + f3f7fb + ';',
                '    -o-box-shadow: inset 0 1px 0 0 ' + f3f7fb + ';',
                '    box-shadow: inset 0 1px 0 0 ' + f3f7fb,
                '}',
                '.x-panel-collapsed .x-window-header-default,.x-panel-collapsed .x-panel-header-default {',
                '    border-color: ' + c99bce8,
                '}',
                '.x-panel-header-default-framed-top {',
                '    background-color: ' + cbddf3 + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + dae7f6 + '), color-stop(45%, ' + cddef3 + '), color-stop(46%, ' + abc7ec + '), color-stop(50%, ' + abc7ec + '), color-stop(51%, ' + b8cfee + '), color-stop(100%, ' + cbddf3 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -moz-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -o-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -ms-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ')',
                '}',
                '.x-panel-header-default-framed {',
                '    border-color: ' + c99bce8 + ';',
                '    background-color: ' + cbddf3 + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + dae7f6 + '), color-stop(45%, ' + cddef3 + '), color-stop(46%, ' + abc7ec + '), color-stop(50%, ' + abc7ec + '), color-stop(51%, ' + b8cfee + '), color-stop(100%, ' + cbddf3 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -moz-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -o-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: -ms-linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    background-image: linear-gradient(top, ' + dae7f6 + ',' + cddef3 + ' 45%,' + abc7ec + ' 46%,' + abc7ec + ' 50%,' + b8cfee + ' 51%,' + cbddf3 + ');',
                '    -moz-box-shadow: ' + f4f8fd + ' 0 1px 0px 0 inset;',
                '    -webkit-box-shadow: ' + f4f8fd + ' 0 1px 0px 0 inset;',
                '    -o-box-shadow: ' + f4f8fd + ' 0 1px 0px 0 inset;',
                '    box-shadow: ' + f4f8fd + '0 1px 0px 0 inset',
                '}',
                '.x-panel-header-text-default-framed {',
                '    color: ' + c04408c + ';',
                '}',
                '.x-panel-default-framed {',
                '    border-color: ' + c99bce8,
                '}',
                '.x-panel-default-framed {',
                '    background-color: ' + dfe9f6,
                '}',
                '.x-panel-body-default-framed {',
                '    background: ' + dfe9f6 + ';',
                '    border-color: ' + c99bce8 + ';',
                '}',
                '.x-mask-msg {',
                '    border-color: ' + c99bce8 + ';',
                '    background-color: ' + dfe9f6,
                '}',
                '.x-mask-msg div {',
                '    border: 1px solid ' + a3bad9 + ';',
                '}',
                '.x-grid-row-selected .x-grid-cell,.x-grid-row-selected .x-grid-rowwrap-div {',
                '    border-color: ' + a3bae9 + ';',
                '    background-color: ' + dfe8f6 + ' !important',
                '}',
                '.x-column-header-over,.x-column-header-sort-ASC,.x-column-header-sort-DESC {',
                '    border-left-color: ' + aaccf6 + ';',
                '    border-right-color: ' + aaccf6 + ';',
                '    background-color: ' + aaccf6 + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + ebf3fd + '), color-stop(39%, ' + ebf3fd + '), color-stop(40%, ' + d9e8fb + '), color-stop(100%, ' + d9e8fb + '));',
                '    background-image: -webkit-linear-gradient(top, ' + ebf3fd + ',' + ebf3fd + ' 39%,' + d9e8fb + ' 40%,' + d9e8fb + ');',
                '    background-image: -moz-linear-gradient(top, ' + ebf3fd + ',' + ebf3fd + ' 39%,' + d9e8fb + ' 40%,' + d9e8fb + ');',
                '    background-image: -o-linear-gradient(top, ' + ebf3fd + ',' + ebf3fd + ' 39%,' + d9e8fb + ' 40%,' + d9e8fb + ');',
                '    background-image: -ms-linear-gradient(top, ' + ebf3fd + ',' + ebf3fd + ' 39%,' + d9e8fb + ' 40%,' + d9e8fb + ');',
                '    background-image: linear-gradient(top, ' + ebf3fd + ',' + ebf3fd + ' 39%,' + d9e8fb + ' 40%,' + d9e8fb + ')',
                '}',
                '.x-menu-item-active .x-menu-item-link {',
                '    background-color: ' + d9e8fb + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + e7f0fc + '), color-stop(100%, ' + c7ddf9 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + e7f0fc + ',' + c7ddf9 + ');',
                '    background-image: -moz-linear-gradient(top, ' + e7f0fc + ',' + c7ddf9 + ');',
                '    background-image: -o-linear-gradient(top, ' + e7f0fc + ',' + c7ddf9 + ');',
                '    background-image: -ms-linear-gradient(top, ' + e7f0fc + ',' + c7ddf9 + ');',
                '    background-image: linear-gradient(top, ' + e7f0fc + ',' + c7ddf9 + ');',
                '    border: 1px solid ' + adjust(color, 0, 22.75, -3) + ';', //#a9cbf5
                '}',
                'table.x-datepicker-inner .x-datepicker-selected a {',
                '    background-color: ' + adjust(color, -1, -6.25, 6.25) + ';', //#dae5f3
                '    border: 1px solid ' + adjust(color, 1, 4.5, -12), //#8db2e3
                '}',
                '.x-datepicker-footer,.x-monthpicker-buttons {',
                '    border-top: 1px solid ' + b2d1f5 + ';',
                '    background-color: ' + dfecfb + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + dee8f5 + '), color-stop(49%, ' + d1dff0 + '), color-stop(51%, ' + c7d8ed + '), color-stop(100%, ' + cbdaee + '));',
                '    background-image: -webkit-linear-gradient(top, ' + dee8f5 + ',' + d1dff0 + ' 49%,' + c7d8ed + ' 51%,' + cbdaee + ');',
                '    background-image: -moz-linear-gradient(top, ' + dee8f5 + ',' + d1dff0 + ' 49%,' + c7d8ed + ' 51%,' + cbdaee + ');',
                '    background-image: -o-linear-gradient(top, ' + dee8f5 + ',' + d1dff0 + ' 49%,' + c7d8ed + ' 51%,' + cbdaee + ');',
                '    background-image: -ms-linear-gradient(top, ' + dee8f5 + ',' + d1dff0 + ' 49%,' + c7d8ed + ' 51%,' + cbdaee + ');',
                '    background-image: linear-gradient(top, ' + dee8f5 + ',' + d1dff0 + ' 49%,' + c7d8ed + ' 51%,' + cbdaee + ');',
                '}',
                '.x-tab-bar {',
                '    background-color: ' + cbdbef + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + dde8f5 + '), color-stop(100%, ' + cbdbef + '));',
                '    background-image: -webkit-linear-gradient(top, ' + dde8f5 + ',' + cbdbef + ');',
                '    background-image: -moz-linear-gradient(top, ' + dde8f5 + ',' + cbdbef + ');',
                '    background-image: -o-linear-gradient(top, ' + dde8f5 + ',' + cbdbef + ');',
                '    background-image: -ms-linear-gradient(top, ' + dde8f5 + ',' + cbdbef + ');',
                '    background-image: linear-gradient(top, ' + dde8f5 + ',' + cbdbef + ');',
                '}',
                '.x-tab-bar-body {',
                '    border-color: ' + c99bce8 + ';',
                '}',

                '.x-tab-default-top {',
                '    border-bottom: 1px solid ' + c99bce8 + ' !important',
                '}',
                '.x-tab-default-top {',
                '    background-color: ' + deecfd + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + ccdef6 + '), color-stop(25%, ' + d6e6fa + '), color-stop(45%, ' + deecfd + '));',
                '    background-image: -webkit-linear-gradient(top, ' + ccdef6 + ',' + d6e6fa + ' 25%,' + deecfd + ' 45%);',
                '    background-image: -moz-linear-gradient(top, ' + ccdef6 + ',' + d6e6fa + ' 25%,' + deecfd + ' 45%);',
                '    background-image: -o-linear-gradient(top, ' + ccdef6 + ',' + d6e6fa + ' 25%,' + deecfd + ' 45%);',
                '    background-image: -ms-linear-gradient(top, ' + ccdef6 + ',' + d6e6fa + ' 25%,' + deecfd + ' 45%);',
                '    background-image: linear-gradient(top, ' + ccdef6 + ',' + d6e6fa + ' 25%,' + deecfd + ' 45%)',
                '}',
                '.x-tab {',
                '    border-color: ' + adjust(color, 0, 4.5, -12) + ';', //#8db3e3
                '}',
                '.x-tab button {',
                '    color: ' + adjust(color, 0, -12.75, -39.25) + ';', // #416da3
                '}',
                '.x-tab-active button {',
                '    color: ' + adjust(color, 0, 17.75, -52.75), //#15498b
                '}',
                '.x-tab-top-active {',
                '    background-color: ' + deecfd + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #ffffff), color-stop(25%, ' + f5f9fe + '), color-stop(45%, ' + deecfd + '));',
                '    background-image: -webkit-linear-gradient(top, #ffffff,' + f5f9fe + ' 25%,' + deecfd + ' 45%);',
                '    background-image: -moz-linear-gradient(top, #ffffff,' + f5f9fe + ' 25%,' + deecfd + ' 45%);',
                '    background-image: -o-linear-gradient(top, #ffffff,' + f5f9fe + ' 25%,' + deecfd + ' 45%);',
                '    background-image: -ms-linear-gradient(top, #ffffff,' + f5f9fe + ' 25%,' + deecfd + ' 45%);',
                '    background-image: linear-gradient(top, #ffffff,' + f5f9fe + ' 25%,' + deecfd + ' 45%)',
                '}',
                '.x-tab-default-top-active {',
                '    border-bottom-color: ' + deecfd + ' !important',
                '}',
                '.x-tab-bar-strip-default,.x-tab-bar-strip-default-plain {',
                '    border-color: ' + c99bce8 + ';',
                '    background-color: ' + deecfd + ';',
                '}',
                '.x-datepicker {',
                '    border: 1px solid ' + adjust(color, 6, 4, -57.5) + ';', //#1b376c
                '}',
                '.x-datepicker a {',
                '    color: ' + c15428b,
                '}',
                '.x-datepicker-header {',
                '    background-color: ' + adjust(color, 6, 0.25, -53) + ';', //#23427c
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + c264888 + '), color-stop(100%, ' + c1f3a6c + '));',
                '    background-image: -webkit-linear-gradient(top, ' + c264888 + ',' + c1f3a6c + ');',
                '    background-image: -moz-linear-gradient(top, ' + c264888 + ',' + c1f3a6c + ');',
                '    background-image: -o-linear-gradient(top, ' + c264888 + ',' + c1f3a6c + ');',
                '    background-image: -ms-linear-gradient(top, ' + c264888 + ',' + c1f3a6c + ');',
                '    background-image: linear-gradient(top, ' + c264888 + ',' + c1f3a6c + ')',
                '}',
                'table.x-datepicker-inner th {',
                '    color: ' + adjust(color, 5, -4, -56) + ';', //#233d6d
                '    border-bottom: 1px solid ' + b2d1f5 + ';',
                '    background-color: ' + dfecfb + ';',
                '    background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, ' + edf4fd + '), color-stop(100%, ' + cde1f9 + '));',
                '    background-image: -webkit-linear-gradient(top, ' + edf4fd + ',' + cde1f9 + ');',
                '    background-image: -moz-linear-gradient(top, ' + edf4fd + ',' + cde1f9 + ');',
                '    background-image: -o-linear-gradient(top, ' + edf4fd + ',' + cde1f9 + ');',
                '    background-image: -ms-linear-gradient(top, ' + edf4fd + ',' + cde1f9 + ');',
                '    background-image: linear-gradient(top, ' + edf4fd + ',' + cde1f9 + ');',
                '}',
                '.x-grid-header-ct {',
                '    border: 1px solid ' + c99bce8 + ';',
                '}',
                '.x-panel .x-grid-body {',
                '    border-color: ' + c99bce8 + ';',
                '}',
                '.x-column-header-trigger {',
                '    background-color: ' + adjust(color, 1, 25.75, 3) + ';', //#c3daf9
                '}',
                'table.x-datepicker-inner a:hover,table.x-datepicker-inner .x-datepicker-disabled a:hover {',
                '    background-color: ' + ddecfe,
                '}',
                '.x-monthpicker-item a.x-monthpicker-selected {',
                '    background-color: ' + dfecfb + ';',
                '    border: 1px solid ' + adjust(color, 1, 4.5, -12), //#8db2e3
                '}',
                '.x-monthpicker-item a:hover {',
                '    background-color: ' + ddecfe,
                '}',
                '.x-fieldset-header {',
                '    color: ' + c15428b + ';',
                '}'
            ];
            Ext.util.CSS.removeStyleSheet('sampleStyle');
            Ext.util.CSS.createStyleSheet(css.join(''), 'sampleStyle');

            if (showWindow) {
                Ext.getCmp('sampleWindow').show();
            }
        },
        items: [{
            xtype: 'panel',
            title: 'Base Color',
            itemId: 'startPanel',
            bodyPadding: 5,
            border: false,
            items: [{
                xtype: 'container',
                layout: 'column',
                items: [{
                    xtype: 'container',
					layout: 'auto',
                    items: [{
                        xtype: 'textfield',
                        itemId: 'start',
                        fieldLabel: 'Hex',
                        value: 'C0D4ED',
                        labelWidth: 75,
                        width: 150,
                        maskRe: /[0-9A-Fa-f]/,
                        regex: /^[0-9A-Fa-f]+$/,
                        minLength: 6,
                        maxLength: 6,
                        allowBlank: false,
                        enforceMaxLength: true,
                        enableKeyEvents: true,
                        setColor: function () {
                            var field = this,
                                startPanel = field.up('panel'),
                                value = field.getValue(),
                                rgb;

                            if (value && field.isValid()) {
                                startPanel.body.setStyle({
                                    'background-color': '#' + value
                                });

                                rgb = hexToRgb(value);
                                startPanel.down('#red').setValue(rgb.r);
                                startPanel.down('#redSlider').setValue(rgb.r);
                                startPanel.down('#green').setValue(rgb.g);
                                startPanel.down('#greenSlider').setValue(rgb.g);
                                startPanel.down('#blue').setValue(rgb.b);
                                startPanel.down('#blueSlider').setValue(rgb.b);

                                panel.showExample(false);
								if (panel.down('#adjustmentPanel').body) {
									panel.calculate();
								}
								panel.suggest();
                            }
                        },
                        listeners: {
                            afterrender: function (field) {
                                field.setColor();
                            },
                            keyup: function (field) {
                                field.setColor();
                            },
                            blur: function (field) {
                                field.setColor();
                            },
                            change: function (field) {
                                field.setColor();
                            }
                        }
                    }, {
                        xtype: 'button',
                        text: 'Reset',
                        listeners: {
                            click: function () {
                                var start = panel.down('#start');

                                start.setValue('C0D4ED');
                                start.setColor();
                                panel.showExample(false);
                            }
                        }
                    }, {
						xtype: 'button',
						text: 'Random',
						listeners: {
                            click: function () {
                                var start = panel.down('#start');

                                start.setValue(Ext.String.leftPad((Math.random() * 0xFFFFFF << 0).toString(16), 6, '0').toUpperCase()); //Thanks to Paul Irish for this one!
                                start.setColor();
                                panel.showExample(false);
                            }
                        }
					}, {
                        xtype: 'button',
                        text: 'Show Window',
                        margin: '0 20 0 0',
                        listeners: {
                            click: function () {
                                panel.showExample(true);
                            }
                        }
                    }]
                }, {
                    xtype: 'container',
                    margin: '0 0 0 20',
                    items: [{
                        xtype: 'container',
                        layout: 'column',
                        items: [{
                            xtype: 'numberfield',
                            decimalPrecision: 0,
                            allowBlank: false,
                            itemId: 'red',
                            fieldLabel: 'Red',
                            labelWidth: 50,
                            minValue: 0,
                            maxValue: 255,
                            maxLength: 3,
                            enforceMaxLength: true,
                            width: 110,
                            margin: '0 10 0 0',
                            setSlider: function () {
                                var field = this;

                                if (panel) {
                                    panel.down('#redSlider').setValue(field.getValue());
                                }
                            },
                            listeners: {
                                change: function (field) {
                                    field.setSlider();
                                },
                                keyup: function (field) {
                                    field.setSlider();
                                },
                                blur: function (field) {
                                    field.setSlider();
                                }
                            }
                        }, {
                            xtype: 'slider',
                            itemId: 'redSlider',
                            width: 400,
                            increment: 1,
                            minValue: 0,
                            maxValue: 255,
                            listeners: {
                                change: function (slider) {
                                    var value = slider.getValue(),
                                        hex = rgbToHex(value, panel.down('#green').getValue(), panel.down('#blue').getValue());

                                    panel.down('#red').setValue(value);
                                    panel.down('#start').setValue(hex);
                                    panel.down('#startPanel').body.setStyle({
                                        'background-color': '#' + hex
                                    });
                                }
                            }
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'column',
                        items: [{
                            xtype: 'numberfield',
                            decimalPrecision: 0,
                            allowBlank: false,
                            itemId: 'green',
                            fieldLabel: 'Green',
                            labelWidth: 50,
                            minValue: 0,
                            maxValue: 255,
                            maxLength: 3,
                            enforceMaxLength: true,
                            width: 110,
                            margin: '0 10 0 0',
                            setSlider: function () {
                                var field = this;

                                if (panel) {
                                    panel.down('#greenSlider').setValue(field.getValue());
                                }
                            },
                            listeners: {
                                change: function (field) {
                                    field.setSlider();
                                },
                                keyup: function (field) {
                                    field.setSlider();
                                },
                                blur: function (field) {
                                    field.setSlider();
                                }
                            }
                        }, {
                            xtype: 'slider',
                            itemId: 'greenSlider',
                            width: 400,
                            increment: 1,
                            minValue: 0,
                            maxValue: 255,
                            listeners: {
                                change: function (slider) {
                                    var value = slider.getValue(),
                                        hex = rgbToHex(panel.down('#red').getValue(), value, panel.down('#blue').getValue());

                                    panel.down('#green').setValue(value);
                                    panel.down('#start').setValue(hex);
                                    panel.down('#startPanel').body.setStyle({
                                        'background-color': '#' + hex
                                    });
                                }
                            }
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'column',
                        items: [{
                            xtype: 'numberfield',
                            decimalPrecision: 0,
                            allowBlank: false,
                            itemId: 'blue',
                            fieldLabel: 'Blue',
                            labelWidth: 50,
                            minValue: 0,
                            maxValue: 255,
                            maxLength: 3,
                            enforceMaxLength: true,
                            width: 110,
                            margin: '0 10 0 0',
                            setSlider: function () {
                                var field = this;

                                if (panel) {
                                    panel.down('#blueSlider').setValue(field.getValue());
                                }
                            },
                            listeners: {
                                change: function (field) {
                                    field.setSlider();
                                },
                                keyup: function (field) {
                                    field.setSlider();
                                },
                                blur: function (field) {
                                    field.setSlider();
                                }
                            }
                        }, {
                            xtype: 'slider',
                            itemId: 'blueSlider',
                            width: 400,
                            increment: 1,
                            minValue: 0,
                            maxValue: 255,
                            listeners: {
                                change: function (slider) {
                                    var value = slider.getValue(),
                                        hex = rgbToHex(panel.down('#red').getValue(), panel.down('#green').getValue(), value);

                                    panel.down('#blue').setValue(value);
                                    panel.down('#start').setValue(hex);
                                    panel.down('#startPanel').body.setStyle({
                                        'background-color': '#' + hex
                                    });
                                }
                            }
                        }]
                    }]
                }, {
                    xtype: 'colorpicker',
                    margin: '0 0 0 25',
                    allowReselect: true,
                    listeners: {
                        select: function (picker, color) {
                            var start = panel.down('#start');

                            start.setValue(color);
                            start.setColor();
                        }
                    }
                }]
            }]
        }, {
            xtype: 'panel',
            title: 'Custom Color Adjustment',
            itemId: 'adjustmentPanel',
			collapsible: true,
            border: false,
            bodyPadding: 5,
			bodyStyle: {
                'background-color': '#99BCE8'
            },
            items: [{
                xtype: 'container',
                layout: 'column',
                items: [{
                    xtype: 'numberfield',
					fieldLabel: 'Hue',
                    itemId: 'hue',
					labelWidth: 40,
                    width: 120,
                    value: 0,
                    decimalPrecision: 3,
                    minValue: -360,
                    maxValue: 360,
                    maxLength: 7,
					margin: '0 20 0 0 ',
                    enforceMaxLength: true,
                    listeners: {
                        change: function () {
                            panel.calculate();
                        },
                        blur: function () {
                            panel.calculate();
                        }
                    }
                }, {
                    xtype: 'numberfield',
					fieldLabel: 'Saturation',
                    itemId: 'saturation',
					labelWidth: 75,
                    width: 155,
                    value: 7.644,
                    decimalPrecision: 3,
                    minValue: -100,
                    maxValue: 100,
                    maxLength: 7,
					margin: '0 20 0 0 ',
                    enforceMaxLength: true,
                    listeners: {
                        change: function () {
                            panel.calculate();
                        },
                        blur: function () {
                            panel.calculate();
                        }
                    }
                }, {
                    xtype: 'numberfield',
					fieldLabel: 'Brightness',
                    itemId: 'brightness',
                    labelWidth: 75,
                    width: 155,
                    margin: '0 5 5 5',
                    value: -8.627,
                    decimalPrecision: 3,
                    minValue: -100,
                    maxValue: 100,
                    maxLength: 7,
                    listeners: {
                        change: function () {
                            panel.calculate();
                        },
                        blur: function () {
                            panel.calculate();
                        }
                    }
                }, {
                    xtype: 'button',
                    margin: '0 0 0 15',
                    text: 'Calculate',
                    listeners: {
                        click: function () {
                            panel.calculate();
                        }
                    }
                }, {
                    xtype: 'displayfield',
                    labelWidth: 65,
                    width: 140,
                    itemId: 'end',
                    fieldLabel: 'New Color',
					value: '#99BCE8',
                    margin: '0 0 0 15'
                }, {
                    xtype: 'button',
                    text: 'Set as new Base',
                    listeners: {
                        click: function () {
                            var start = panel.down('#start');

                            start.setValue(panel.down('#end').getValue().substring(1));
                            start.setColor();
                        }
                    }
                }]
            }]
        }, {
			xtype: 'panel',
			flex: 1,
			border: false,
			title: 'Variations',
			layout: 'column',
			items: [{
				xtype: 'panel',
				itemId: 'hueSuggestions',
				frame: true,
				title: 'Hue Variations',
				bodyPadding: '0 0 0 45',
				margin: 10,
				width: 300
			}, {
				xtype: 'panel',
				itemId: 'saturationSuggestions',
				frame: true,
				title: 'Saturation Variations',
				bodyPadding: '0 0 0 40',
				margin: 10,
				width: 150
			}, {
				xtype: 'panel',
				itemId: 'brightnessSuggestions',
				frame: true,
				title: 'Brightness Variations',
				bodyPadding: '0 0 0 40',
				margin: 10,
				width: 150
			}]
		}]
    });

    sampleWindow = Ext.create('Ext.window.Window', {
        title: 'Sample Window',
        id: 'sampleWindow',
        height: 600,
        width: 630,
        closeAction: 'hide',
        layout: 'fit',
        bodyPadding: 5,
        buttons: [{
            text: 'Sample Button'
        }],
        items: [{
            xtype: 'panel',
            title: 'Sample Panel',
			autoScroll: true,
            bodyPadding: 5,
            tbar: [{
                xtype: 'button',
                text: 'Sample'
            }, {
                xtype: 'button',
                text: 'Toolbar'
            }, {
                xtype: 'button',
                text: 'Buttons'
            }],
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                height: 200,
                items: [{
                    xtype: 'panel',
                    title: 'Sample Framed Panel',
                    height: 200,
                    flex: 1,
                    frame: true,
                    margin: '0 5 0 0'
                }, {
                    xtype: 'panel',
                    title: 'Sample Masked Panel',
                    height: 200,
                    flex: 1,
                    listeners: {
                        render: function (p) {
                            p.body.mask('Loading...');
                        },
                        delay: 1000
                    },
                    margin: '0 5 0 0'
                }, {
                    xtype: 'datepicker'
                }]
            }, {
                xtype: 'tabpanel',
                title: 'Sample Tab Panel',
                margin: '5 0 0 0',
                layout: 'fit',
                height: 100,
                items: [{
                    xtype: 'panel',
                    title: 'Tab 1',
                    layout: 'fit',
                    items: [{
                        xtype: 'fieldset',
                        title: 'Sample Fieldset',
                        margin: '0 5 5 5'
                    }]
                }, {
                    xtype: 'panel',
                    title: 'Tab 2'
                }, {
                    xtype: 'panel',
                    title: 'Tab 3'
                }, {
                    xtype: 'panel',
                    title: 'Tab 4',
                    closable: true
                }]
            }, {
                xtype: 'grid',
                title: 'Sample Grid',
                margin: '5 0 0 0',
                height: 150,
                store: Ext.create('Ext.data.Store', {
                    data: [
                        { field1: 'Sample', field2: 'data', field3: 'fields' },
                        { field1: 'Sample 2', field2: 'data 2', field3: 'fields 2' },
                        { field1: 'Sample 3', field2: 'data 3', field3: 'fields 3' }
                    ],
                    fields: ['field1', 'field2', 'field3'],
                    proxy: {
                        type: 'memory'
                    }
                }),
                columns: [{
                    header: 'Column',
                    dataIndex: 'field1',
                    flex: 1
                }, {
                    header: 'Column',
                    dataIndex: 'field2',
                    flex: 1
                }, {
                    header: 'Column',
                    dataIndex: 'field3',
                    flex: 1
                }]
            }]
        }]
    });

    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [{
            region: 'center',
            layout: 'fit',
            items: panel
        }]
    });
});