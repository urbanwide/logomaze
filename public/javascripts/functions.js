/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function Vector() {}

Vector.rotate = function (x,y,rad) {
    var sinA = Math.sin(rad);
    var cosA = Math.cos(rad);
    return {x: cosA*x-sinA*y, y: sinA*x+cosA*y};
}

function deg2rad(d) {return (d / 180) * Math.PI;}
function rad2deg(r) {return r * 180 / Math.PI;}

function round(n,d) {
    var x = 1000000;
    if(d!=null) {
        x = Math.pow(10, d);
    }
    return Math.round(n*x)/x;
}

function setCookie(c_name,value,expiredays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
}

function getCookie(c_name) {
    if (document.cookie.length>0)
      {
      c_start=document.cookie.indexOf(c_name + "=");
      if (c_start!=-1)
        {
        c_start=c_start + c_name.length+1;
        c_end=document.cookie.indexOf(";",c_start);
        if (c_end==-1) c_end=document.cookie.length;
        return unescape(document.cookie.substring(c_start,c_end));
        }
      }
    return null;
}


var oldStatus = '';
function setStatus(message) {
    oldStatus = $('#status').html();
    $('#status').html(message);
}

function setOldStatus() {
    $('#status').html(oldStatus);
}


