# Footer Editor with Emmet Support

The footer editor now includes full Emmet support for enhanced HTML editing experience.

## Emmet Features

### HTML Abbreviations
- **Basic elements**: `div`, `p`, `span`, etc.
- **Classes and IDs**: `div.container`, `#header`, `div.container#main`
- **Nesting**: `div>p>span`, `ul>li*3`
- **Siblings**: `div+p+span`
- **Multiplication**: `div*5`, `li*3>a`

### Common Emmet Examples

```html
<!-- Type: div.container -->
<div class="container"></div>

<!-- Type: div#main.container -->
<div id="main" class="container"></div>

<!-- Type: ul>li*3>a -->
<ul>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
</ul>

<!-- Type: form>input:text+input:email+button -->
<form action="">
    <input type="text" name="" id="">
    <input type="email" name="" id="">
    <button></button>
</form>

<!-- Type: table>tr*3>td*4 -->
<table>
    <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
</table>
```

### CSS Abbreviations
- **Properties**: `m10` → `margin: 10px;`
- **Units**: `p20` → `padding: 20px;`
- **Values**: `w100` → `width: 100px;`

## How It Works

1. **Automatic Initialization**: Emmet is automatically initialized when Monaco editor loads
2. **HTML Language Support**: Optimized for HTML editing with proper syntax profiles
3. **Real-time Suggestions**: Get Emmet abbreviation suggestions as you type
4. **Tab Completion**: Use Tab key to expand Emmet abbreviations

## Configuration

Emmet is configured with the following options:
- `showAbbreviationSuggestions: true` - Shows suggestions for abbreviations
- `showExpandedAbbreviation: 'markup'` - Shows expanded HTML in suggestions
- `syntaxProfiles.html.filters: 'html'` - Optimized for HTML editing

## Usage Tips

1. **Start typing** any HTML element name
2. **Add classes** with `.className`
3. **Add IDs** with `#idName`
4. **Use nesting** with `>` for child elements
5. **Use siblings** with `+` for adjacent elements
6. **Multiply elements** with `*number`
7. **Press Tab** to expand abbreviations

## Browser Compatibility

Emmet support works in all modern browsers and is automatically loaded when Monaco editor initializes.
