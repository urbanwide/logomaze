/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function ErrorMessages(code, line, key) {
    line = line + 1;
	switch(code) {
        case 100:
            return 'Error on the line '+line+': Divide by zero.';
        case 110:
            return 'Error on the line '+line+': Found an unidentifical number "<b>'+key+'</b>".';
        case 120:
            return "Error on the line "+line+" : Found unknown keyword '<b>"+key+"</b>' .";
        case 130:
            return 'Error on line '+line+': Syntax error near the symbol \')\'.';
        case 140:
            return "Error near the line "+line+": This end bracket doesn't have start bracket. ";
        case 150:
            return "Error on the line "+line+": Variable '<b>"+key+"</b>' is unidentifical.";
        case 160:
            return "Error on the line "+line+": Not close all brackets.";
        case 170:
            return 'Error on the line '+line+': The square rooting of negative number.';
	case 180:
            return 'Error on the line '+line+": Tangent isn't defined for this number "+key+' .';
       }
}

function translate(kod) {
    var TranslateText = [];

    TranslateText['drawing'] = 'Drawing ...';
    TranslateText['done'] = 'Done';
    TranslateText['krokuji_automat'] = 'Stepping ... (automatically at the rate of one step in %d ms)';
    TranslateText['krokuji_manual'] = 'Stepping ... (manually)';
    TranslateText['paused'] = 'Paused';
    TranslateText['stoped'] = 'Stopped';
    
    TranslateText['drawButtonLabel'] = 'Draw';
    TranslateText['drawButtonDescription'] = 'Draw the picture.';
    TranslateText['debugButtonLabel'] = 'Stepping';
    TranslateText['debugButtonDescription'] = 'Steps for each line of code and directly renders.';
    TranslateText['pauseButtonLabel'] = 'Pause stepping';
    TranslateText['pauseButtonDescription'] = 'Temporary pause or restart stepping through code.';
    TranslateText['stopButtonLabel'] = 'Break stepping';
    TranslateText['stopButtonDescription'] = 'Permanently suspended stepping through code.';
    TranslateText['timerButtonLabel'] = 'Automatically / manually stepping';
    TranslateText['timerButtonDescription'] = 'Switching auto / manual stepping through code.';
    TranslateText['speedText'] = 'Speed: ';
    TranslateText['speedButtonLabel'] = 'Set step speed';
    TranslateText['speedButtonDescription'] = 'Sets speed automatic stepping from 100ms to 1s.';


    TranslateText['mainTitle'] = 'Turtle graphics editor';
    TranslateText['htmlTitle'] = 'Web Editor turtle graphics';
    TranslateText['messageText'] = 'Errors';
    TranslateText['debugText'] = 'Debugging';
    TranslateText['exampleText'] = 'Examples';
    TranslateText['syntaxText'] = 'Syntax';
    return TranslateText[kod];
}
