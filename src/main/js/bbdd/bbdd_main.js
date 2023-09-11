
import {cargando, listo, dbit} from '../test.js'
const $ = require('jquery');
const bootstrap = require('bootstrap');

// mssql
import {cnxDB, queryEmpresas, queryUsuarios, borrarUsuario, queryTerminales, queryHorarios,guardarUsuario} from './sql server/mssql.js'
import {terminalesNavegacion} from '../test.js'
// MYSQL
// import {cnxDB} from ./sql server/mysql.js
// en caso de cambiar, comentar la otra importacion de MSSQL

// VARIABLES DEBUG
var LST_TRM
var LST_USRS
var LST_EMP

//-------------


var pags 





export async function busquedaUsuarios(query){


    LST_USRS = await queryUsuarios()

    
    return LST_USRS
}


// OBTENCION DE LOS DATOS DE LA QUERY A RAIZ DE UN JSON QUE HA GENERADO SQL SERVER. 

// SE USA ADEMÁS LA QUERY DE EMPRESAS.


export async function generarDatos_Usuario(){

        try{
            // OBTENER CANTIDAD DE RESULTADOS DE LA QUERY
           

            var re = await queryEmpresas()

            $('#emp').empty()
            LST_EMP = re
            pags = Object.keys(LST_USRS).length
            for (let x = 0 ; x < re.length;x++){
              
              $('#emp').append('<option value = "' + re[x].Contrata + '">' + re[x].Contrata + '</option>' )
            }
            var pgActual = 0

            var r = await queryUsuarios()

            // Botones de navegación

            cambioDatos_Usuario(r[0])
            
            $('#ini').on('click',function(){
                pgActual = 0

                cambioDatos_Usuario(r[pgActual])
                
            })
            $('#ant').on('click',function(){
                if(pgActual != 0){
                    pgActual = pgActual - 1

                    cambioDatos_Usuario(r[pgActual])
                } else{
                    cambioDatos_Usuario(r[pgActual])
                }
            })
            $('#sig').on('click',function () {
                if (pgActual != (pags-1)){
                   
                    pgActual = pgActual + 1
                    console.log(pgActual)
                    cambioDatos_Usuario(r[pgActual])
                } else {
                    cambioDatos_Usuario(r[pgActual])
                }
              })

            $('#ult').on('click',function(){
                pgActual = pags-1

                cambioDatos_Usuario(r[pgActual])
            })


            // MANEJO DE ELIMINACIÓN

            $('#cnc').on('click',function () {
                var resultado = confirm("¿Seguro que quieres borrar esta entrada?")
                if (resultado){
                    borrarUSRSeleccionado()
                } 
              })


              


              $('#guardar').on('click',function () { 

                var data = {
                    idt: $('#idt').val(), // ID
                    emp: $('#emp').val(), // empresa
                    nom: $('#nom').val(), // nombre
                    ap1: $('#ap1').val(), // apellido
                    ap2: $('#ap2').val(), // apellido
                    ia: $('#ia').val(), // fecha ausencia
                    fa: $('#fa').val(), // fin ausencia
                    fb: $('#fb').val(), // fecha baja
                    da: $('#da').is(':checked'), // denegar acceso
                    apb: $('#apb').is(':checked'), // aplicar apb
                    pin: $('#pin').val(), // PIN
                    tarj: $('#tarj').val(), // tarjeta
                    tbt: $('#tbt').is(':checked'), // brazo torno
                    aa: $('#aa').is(':checked') // alarma
                  };

                  guardarQuery(data)


               })

             

        } catch (e) {

            console.log("Dije que te olvideee" + "   " + e)
        }



}

// La query devolverá un JSON y esta funcion lo pasará.
export function generarTablaUsr(lt){
     lt = LST_USRS
     $('#table').parent().parent().prepend('<input type="text" id="searchInput" placeholder="Buscar..." class="form-control mb-3">');
     $('#table').empty().addClass('table table-hover'); // Clase "table-hover" para el efecto hover

  try {
    let header = '<tr>';
    $.each(Object.keys(LST_USRS[0]), function(i, key) {
        header += '<th>' + key + '</th>';
    });
    header += '</tr>';
    $('#table').append(header);

    // Crear las filas de datos
    $.each(LST_USRS, function(i, employee) {
        let row = '<tr  class="filaDatos">';
        $.each(employee, function(key, value) {
          value = value + ''
          if(value.indexOf('GMT+0')>-1){
            value = edfecha(value)
          }
            row += '<td>' + value + '</td>';
        });
        row += '</tr>';
        $('#table').append(row);
    });

    // Añadir evento de click a las filas
    $('#table tr').on('click',function() {
      // Acciones al hacer clic en una fila
      if ($(this).hasClass('SELECCIONADO')){
        $(this).removeClass()
      } else {
        $(this).addClass('SELECCIONADO')
      }

    });

  } catch (e) {
    console.log("ERROR AL CARGAR DATOS EN TABLA");
    alert('Hubo un error a la hora de obtener los datos. ' + e);
    return 'ERROR EN LA CARGA';
  }

  // Filtro de búsqueda
  $('#searchInput').on('keyup', function() {
    let value = $(this).val().toLowerCase();
    $(".table .filaDatos").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });



  botonesLista()
  return "USUARIOS CARGADOS.";

}


import {setupContent,usuariosNavegacion,resizeContent} from '../test.js'


//BOTONES DE LA LISTA DE USUARIOS

async function botonesLista(){
    $('#add').on('click',function(){
        $('.content').load('src/main/html/usuarios.html', function() {
            setupContent();
            usuariosNavegacion();
            resizeContent('usuarios-content');
           
          });
          setTimeout(() => {
            vaciarDatos_Usuario()
          }, 0);
         
          
    })

    // MODIFICAR DATOS
    $('#modify').on('click',function(){
      var sl = 0
      $('.SELECCIONADO').each(function() {
        

        if (sl == 0){
          var kc = $(this).children().first().text()
          $('.content').load('src/main/html/usuarios.html', function() {
            setupContent();
            usuariosNavegacion();
          
          });
          setTimeout(async () => {
            var re= await queryEmpresas()
            console.log(re)
            LST_EMP = re
            pags = Object.keys(LST_EMP).length
            for (let x = 0 ; x < re.length;x++){
              
              $('#emp').append('<option value = "' + re[x].Contrata + '">' + re[x].Contrata + '</option>' )
            }
            kc = kc-1
            var gfd =parseInt(kc)
            console.log(LST_USRS)
            console.log('askgoasjkglsajgkas')
            cambioDatos_Usuario(LST_USRS[gfd])
          }, 0);
          sl++
        }
      })

      
     
    })

    $('#delete').on('click',function () {
        var rs = confirm("¿Seguro que quieres borrar los elementos seleccionados? Esta acción no se puede deshacer.")
        if (rs ){
            borrarUSRSeleccionado()
        }


      })
}

export async function generarTerminalesLista(){
    
var resultadoQuery = await queryTerminales()
console.log(resultadoQuery)
let keys = Object.keys(resultadoQuery[0]);

  // Create the header with the keys
  let header = '<tr>';
  keys.forEach(function (key) {
    header += '<th>' + key + '</th>';
  });
  header += '</tr>';

  // Create rows with values
  let rows = '';
  resultadoQuery.forEach(function (record) {
    rows += '<tr class="filaDatos">';
    keys.forEach(function (key) {
      rows += '<td>' + record[key] + '</td>';
    });
    rows += '</tr>';
  });

  // Create full table
  let table = '<table class="table table-hover" id="table">' +
              '<thead>' + header + '</thead>' +
              '<tbody>' + rows + '</tbody>' +
              '</table>';

        
$('.table-container').html(table);
$('#table').parent().parent().prepend('<input type="text" id="searchInput" placeholder="Buscar..." class="form-control mb-3">');






$('.table tr').on('click', function() {
  if ($(this).hasClass('SELECCIONADO')) {
    $(this).removeClass();
  } else {
    $(this).addClass('SELECCIONADO');
  }
})

 // Filtro de búsqueda
 $('#searchInput').on('keyup', function() {
    let value = $(this).val().toLowerCase();
    $(".table .filaDatos").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });



    // BOTONES DE ABAJO
/*
    $('#add').on('click',function(){

      $('.content').load('src/main/html/terminales/datos_terminales.html', function() {
        setupContent();
        terminalesNavegacion()
        vaciarTerminales()

      });
    })

    $('#modify').on('click',function(){
      var sl = 0
      $('.SELECCIONADO').each(function() {
        if (sl == 0){
          var kc = $(this).children().first().text()
          $('.content').load('src/main/html/terminales/datos_terminales.html', function() {
            setupContent();
            terminalesNavegacion()
          });

          sl++
        }
      })
    })

    $('#delete').on('click',function(){

    })

*/

}

function vaciarTerminales(){

  



}

var listadoHorario

export async function generarHorarioLista(){
    
    var resultadoQuery = await queryHorarios()
    listadoHorario = resultadoQuery
    console.log(typeof(resultadoQuery))
    if (resultadoQuery.length > 0) {
      let keys = Object.keys(resultadoQuery[0]);
      let header = '<tr>';
      keys.forEach(function(key) {
        header += '<th>' + key + '</th>';
      });
      header += '</tr>';
    
      // Crear las filas con los valores
      let rows = '';
      resultadoQuery.forEach(function(row) {
        let values = Object.values(row);
        rows += '<tr class="filaDatos">';
        values.forEach(function(value) {
          rows += '<td>' + value + '</td>';
        });
        rows += '</tr>';
      });
    
      let table = '<table class="table table-hover" id="table">' +
                  '<thead>' + header + '</thead>' +
                  '<tbody>' + rows + '</tbody>' +
                  '</table>';
    
      $('.table-container').html(table);
      $('#table').parent().parent().prepend('<input type="text" id="searchInput" placeholder="Buscar..." class="form-control mb-3">');
    
      $('.table tr').on('click', function() {
        if ($(this).hasClass('SELECCIONADO')) {
          $(this).removeClass('SELECCIONADO');
        } else {
          $(this).addClass('SELECCIONADO');
        }
      });

 // Filtro de búsqueda
 $('#searchInput').on('keyup', function() {
    let value = $(this).val().toLowerCase();
    $("#table .filaDatos").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });


} else {
  console.log("No hay resultado horarios")
}
}


export function generarPermisosLista(){

    // GENERACION DE TABLAS A RAIZ DEL JSON DE PERMISOS, QUE SE OBTIENE DE UNA QUERY

    let header = '<tr>';
    Object.keys(permisos[0]).forEach(function(key) {
      header += '<th>' + key + '</th>';
    });
    header += '</tr>';

    let rows = '';
    permisos.forEach(function(row) {
      let rowData = '<tr class="filaDatos">';
      Object.values(row).forEach(function(value) {

        console.log(value)
        rowData += '<td>' + value + '</td>';
      });
      rowData += '</tr>';
      rows += rowData;
    });
  

    let table = '<table class="table table-hover">' +
                '<thead>' + header + '</thead>' +
                '<tbody>' + rows + '</tbody>' +
                '</table>';
  
    // SE INSERTA LA TABLA UNA VEZ GENERADA EN LA MEMORIA 


    $('.list-container').html(table);


    // SE AÑADE LA FUNCION DE PODER ELEGIR DISTINTOS PERMISOS A LA VEZ.

    $('.table tr').on('click',function() {

      if ($(this).hasClass('SELECCIONADO')){
        $(this).removeClass()
      } else {
        $(this).addClass('SELECCIONADO')
      }})

  }



// FUNCION PARA DEJAR VACIA LA PATNALLA DE DATOS USUARIO

async function vaciarDatos_Usuario(){
  var {uno,dos,tres,cuatro,cinco,seis,siete,ocho,nueve,diez} = ""
  var{once,doce,trece,catorce} = false
  $('#idt').val(pags);
 $('#nom').val(dos);
 $('#emp').val(tres)
 $('#ap1').val(cuatro);
  $('#ap2').val(cinco);
  $('#ia').val(seis);
  $('#fa').val(siete);
  $('#fb').val(ocho);
  $('#pin').val(nueve);
  $('#tarj').val(diez);

  var re= await queryEmpresas()
  console.log(re)
  LST_EMP = re.
  pags = Object.keys(LST_EMP).length
  for (let x = 0 ; x < re.length;x++){
    
    $('#emp').append('<option value = "' + re[x].Contrata + '">' + re[x].Contrata + '</option>' )
  }
}


// FUNCIÓN QUE NOS RELLENA LA INTERFAZ DE DATOS DE USUARIO

async function cambioDatos_Usuario(g){
var r =await g
console.log(r)
console.log("^^^^")
var uno =  r.idUsuario,
  dos =  r.Nombre,
  cuatro = r.Apellido1,
  cinco = r.Apellido2,
  seis = edfecha(r['Inicio Ausencia']), // Usa notación de corchetes para acceder a columnas con espacios
  siete = edfecha(r['Fin Ausencia']),   
  ocho = edfecha(r.FechaBaja),          
  nueve = r.Pin,
  diez = r.idTarjeta,
  once = r.Denegado,
  doce = r.APB,
  trece = r.TirarBrazo,
  catorce = r.ActDesactAlarma;
  try{
    var tres = LST_EMP[r.idContrata-1].Contrata
  } catch{
    tres = ""
  }

      try{
          $('#idt').val(uno);
          $('#nom').val(dos);
          $('#emp').val(tres)
          $('#ap1').val(cuatro);
           $('#ap2').val(cinco);
           $('#ia').val(seis);
           $('#fa').val(siete);
           $('#fb').val(ocho);
           $('#pin').val(nueve);
           $('#tarj').val(diez);
           if (once == true || once == 1){
               $('#da').prop('checked', true);
           }
           if (doce == true || doce == 1){
               $('#apb').prop('checked', true); 
           }
           if (trece == true || trece == 1){
               $('#tbt').prop('checked', true);
           }
           if (catorce == true || catorce == 1){
               $('#aa').prop('checked', true);
           }
      } catch(e){
          console.log(e)
      }
 
}

// MANEJO DE FECHAS DE SQL


function edfecha(rd) {
var fecha = new Date(rd);
var dia = fecha.getDate();
var mes = fecha.getMonth() + 1; // Los meses en JavaScript están basados en 0
var anio = fecha.getFullYear();

return dia + '/' + mes + '/' + anio;
}

// CARGA DE LAS EMPRESAS PARA TENER LA LISTA ENTERA DE EMPRESAS REGISTRADAS

export function cargarEmpresas() {
  // Listado de empresas para los usuarios
  try{
      LST_EMP = queryEmpresas()

  } catch {
      console.log("ERROR AL CARGAR LISTADO DE EMPRESAS")
  }


}


export function listaTerminales(){

  return queryTerminales()

}


// FUNCIONES RELACIONADAS CON LAS QUERIES

function borrarUSRSeleccionado(){
    
    let idsSeleccionados = [];

    $('.SELECCIONADO').each(function() {

      borrarUsuario($(this).children().first().text())
    });
  


}
function guardarQuery(r){

    guardarUsuario(r)


    busquedaUsuarios(r)
}