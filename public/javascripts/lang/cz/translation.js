/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function ErrorMessages(code, line, key) {
    line = line + 1;
    switch(code) {
        case 100:
            return 'Chyba na řádku '+line+': Dělení nulou.';
        case 110:
            return 'Chyba na řádku '+line+': Nalezeno neznámé číslo "<b>'+key+'</b>".';
        case 120:
            return "Chyba na řádku "+line+": Nalezen neznámý výraz '<b>"+key+"</b>'";
        case 130:
            return 'Chyba na řádku '+line+": Syntaktická  chyba poblíž symbolu ')'.";
        case 140:
            return "Chyba na řádku "+line+": Pro tuto pravou závorku nebyla nalezena levá závorka.";
        case 150:
            return "Chyba na řádku "+line+": Neznámá proměnná '<b>"+key+"</b>'.";
        case 160:
            return "Chyba na řádku "+line+": Nejsou uzavřeny všechny závorky. Nějaká pravá závorka schází.";
        case 170:
            return 'Chyba na řádku '+line+': Odmocňování záporného čísla '+key+'.';
	case 180:
            return 'Chyba na řádku '+line+": Tangens není definován pro "+key+'°.';
    }
    /*
	switch(code) {
        case 100:
            return 'Error on the line '+line+': Divide by zero.';
        case 110:
            return 'Error on the line '+line+': Unidentifical number "<b>'+key+'</b>".';
        case 120:
            return "Error on the line "+line+" : Keyword '<b>"+key+"</b>' is understand.";
        case 130:
            return 'Error on line '+line+': Syntax error near the symbol \')\'.';
        case 140:
            return "Error near the line "+line+": This end bracket doesn't have start brakcet. ";
        case 150:
            return "Error on the line "+line+": Variable '<b>"+key+"</b>' is unidentifical.";
        case 160:
            return "Error on the line "+line+": Not close all brackets.";
        case 170:
            return 'Error on the line '+line+': The square root of negative number.';
	case 180:
            return 'Error on the line '+line+": Tangens isn't defined in this number "+key+' .';
       }
    */	
}

function translate(kod) {
    var TranslateText = [];

    TranslateText['drawing'] = 'Vykresluji ...';
    TranslateText['done'] = 'Hotovo';
    TranslateText['krokuji_automat'] = 'Krokuji ... (automaticky, rychlostí jeden krok za %d ms)';
    TranslateText['krokuji_manual'] = 'Krokuji ... (manuálně)';
    TranslateText['paused'] = 'Pozastaveno';
    TranslateText['stoped'] = 'Přerušeno';
    
    TranslateText['drawButtonLabel'] = 'Vykresli';
    TranslateText['drawButtonDescription'] = 'Vykreslí celý obrázek.';
    TranslateText['debugButtonLabel'] = 'Krokuj';
    TranslateText['debugButtonDescription'] = 'Krokuje jednotlivé řádky kódu a přímo je vykresluje.';
    TranslateText['pauseButtonLabel'] = 'Pozastav krokování';
    TranslateText['pauseButtonDescription'] = 'Dočasné pozastaví či znovu spustí krokování kódu.';
    TranslateText['stopButtonLabel'] = 'Přeruš krokování';
    TranslateText['stopButtonDescription'] = 'Trvale přeruší krokování kódu.';
    TranslateText['timerButtonLabel'] = 'Automatické / manuální krokování';
    TranslateText['timerButtonDescription'] = 'Přepínání manuálního / automatického krokování kódu.';
    TranslateText['speedText'] = 'Rychlost: ';
    TranslateText['speedButtonLabel'] = 'Nastav rychlost krokování';
    TranslateText['speedButtonDescription'] = 'Nastavuje rychlost automatického krokování krokování od 100ms do 1s.';


    TranslateText['mainTitle'] = 'Editor želví grafiky';
    TranslateText['htmlTitle'] = 'Webový editor želví grafiky ';
    TranslateText['messageText'] = 'Chyby';
    TranslateText['debugText'] = 'Ladění';
    TranslateText['exampleText'] = 'Příklady';
    TranslateText['syntaxText'] = 'Syntax';
    return TranslateText[kod];
}
