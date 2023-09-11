const sql = require('mssql');
const fs = require('fs');
var config


var TBL_CONTRATA,TBL_USR,TBL_TERMINALES,TBL_HORA,TBL_CAL




function parseConfig() {
    
    const configData = fs.readFileSync('src/main/js/bbdd/sql server/bd.cfg', 'utf8');
    const configLines = configData.split('\n');
    const config = {};
    
    configLines.forEach(line => {
        const [key, value] = line.split('=');
        config[key.trim()] = value.trim();
    });

    TBL_CONTRATA = config.TBL_CONTRATA
    TBL_USR = config.TBL_USR
    TBL_TERMINALES=config.TBL_TERMINALES
    TBL_HORA = config.TBL_HORA
    TBL_CAL = config.TBL_CAL





    const dbConfig = {
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        server: config.DB_HOST,
        database: config.DB_NAME,
        port: parseInt(config.DB_PORT),
        options: {
            encrypt: false, // En caso de conexión segura
        },
    };

    return dbConfig;
    
}


export function cnxDB() {
    config = parseConfig()
    try {
        sql.connect(config);        
        
        console.log('CONEXIÓN CON BBDD OK');

        return true
    } catch (error) {
        console.error('ERROR AL CONECTAR CON BBDD: ', error);
        return false
    }
}


import { Alert } from 'bootstrap';
import { cargando,listo,dbit } from '../../test.js';

export async function queryEmpresas(){
    cargando()
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM AccessCtrl14_ITACA.dbo.' + TBL_CONTRATA);  

        if (result.recordset.length > 0) {

          } else {
            console.log('No se encontraron filas.');
          }

        pool.close();
        return result.recordset
    } catch (error) {
        console.error('Error:', error);
    }

    listo()


}

export async function guardarUsuario(dt){

  try {
    const pool = await sql.connect(config);
    var sql = `
    MERGE INTO [AccessCtrl14_ITACA].[dbo].[Usuario] AS target
    USING (
        SELECT ${dt.idt} AS idt
    ) AS source
    ON target.[idUsuario] = source.idt
    WHEN MATCHED THEN
        UPDATE SET
            [Estado] = ${dt.est || 'null'},
            [Nombre] = ${dt.nom || 'null'},
            [Apellido1] = ${dt.ap1 || 'null'},
            [Apellido2] = ${dt.ap2 || 'null'},
    WHEN NOT MATCHED THEN
        INSERT ([Estado], [Nombre], [Apellido1], [Apellido2], [DNI],
            [idTarjeta], [Pin], [Inicio Ausencia], [Fin Ausencia], [Visitante], [Denegado],
            [APB], [Eliminar], [idContrata], [idSubContrata], [idActividad], [Huella],
            [FechaBaja], [ExcepcionBio], [TirarBrazo], [ActDesactAlarma], [Telefono], [eMail]
        ) VALUES (
            ${dt.est || 'null'},
            ${dt.nom || 'null'},
            ${dt.ap1 || 'null'},
            ${dt.ap2 || 'null'},
            ${dt.dni || 'null'},
            ${dt.tarj || 'null'},
            ${dt.pin || 'null'},
            ${dt.ia || 'null'},
            ${dt.fa || 'null'},
            ${dt.vis || 'null'},
            ${dt.den || 'null'},
            ${dt.apb || 'null'},
            null,
            ${dt.con || 'null'},
            ${dt.subcon || 'null'},
            ${dt.act || 'null'},
            ${dt.hue || 'null'},
            ${dt.fb || 'null'},
            ${dt.exbio || 'null'},
            ${dt.tb || 'null'},
            ${dt.aad || 'null'},
            ${dt.tel || 'null'},
            ${dt.email || 'null'}
        );`;


    alert("Se han insertado los datos")
  } catch(e){
    alert("Error: " + e)
  }


}

export async function queryUsuarios(){

    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT [idUsuario], [idContrata], [Nombre], [Apellido1],'+
         '[Apellido2], [Inicio Ausencia], [Fin Ausencia], [FechaBaja], [Pin], [idTarjeta], [Denegado], [APB], [TirarBrazo], [ActDesactAlarma]'+
        ' FROM AccessCtrl14_ITACA.dbo.' + TBL_USR);  

        if (result.recordset.length > 0) {
            const rows = result.recordset;

          } else {
            console.log('No se encontraron filas.');
          }

        pool.close();
        return await result.recordset
    } catch (error) {
        console.error('Error:', error);
    }


}

export async function borrarUsuario(ID){
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`DELETE FROM AccessCtrl14_ITACA.dbo.${TBL_USR} WHERE [idUsuario] = ${ID}`);
        
        if (result.rowsAffected[0] > 0) {
            console.log(`Usuario con ID ${ID} eliminado exitosamente.`);
        } else {
            console.log(`No se encontró un usuario con ID ${ID}. No se realizó ninguna eliminación.`);
        }

        pool.close();
        return result.rowsAffected[0];
    } catch (error) {
        console.error('Error:', error);
        return -1; // O algún valor para indicar un error en la eliminación
    }



}


export async function queryHorarios(){
    try {
        const pool = await new sql.connect(config);
        const result = await pool.request()
          .query(`SELECT [idHorario]
                        ,[Descripcion]
                        ,[Hora Inicio 1]
                        ,[Hora Fin 1]
                        ,[Hora Inicio 2]
                        ,[Hora Fin 2]
                        ,[Hora Inicio 3]
                        ,[Hora Fin 3]
                        ,[Estado]
                  FROM [AccessCtrl14_ITACA].[dbo].${TBL_HORA}`);
        return result.recordset
      } catch (err) {
        console.error(err);
      }
}
export async function actualizarHorario(data){
    var pool =await sql.connect(config)

    const checkResult = await pool.request()
      .input('id', sql.Int, data.id)
      .query('SELECT COUNT(*) as count FROM [AccessCtrl14_ITACA].[dbo].[Horario] WHERE [idHorario] = @id');

    const exists = checkResult.recordset[0].count > 0;
    if (exists) {
        // Actualizar si el ID ya existe
        await pool.request().query(`
          UPDATE [AccessCtrl14_ITACA].[dbo].${TBL_HORA}
          SET 
            [Descripcion] = '${data.desc}',
            [Hora Inicio 1] = '${data.i1s}',
            [Hora Fin 1] = '${data.i1e}',
            [Hora Inicio 2] = '${data.i2s}',
            [Hora Fin 2] = '${data.i2e}',
            [Hora Inicio 3] = '${data.i3s}',
            [Hora Fin 3] = '${data.i3e}'
          WHERE [idHorario] = ${data.id}
        `);
        alert('Datos Actualizados');
      } else {
        // Insertar si el ID no existe
        await pool.request().query(`
          INSERT INTO [AccessCtrl14_ITACA].[dbo].${TBL_HORA} 
          ([idHorario], [Descripcion], [Hora Inicio 1], [Hora Fin 1], [Hora Inicio 2], [Hora Fin 2], [Hora Inicio 3], [Hora Fin 3])
          VALUES
          (${data.id}, '${data.desc}', '${data.i1s}', '${data.i1e}', '${data.i2s}', '${data.i2e}', '${data.i3s}', '${data.i3e}')
        `);
        alert('Datos Insertados');
      }
    }


export async function queryTerminales(){

    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT idTerminal,Presencia, Acceso, AntiPB, FichajeMasivo, RegErrores, LectorAux, HorariosAux, AbreSiempreAux, '
        +'Tipo, Modo, Modo_com, IP, TipoIdentificacion, Cort_in, Cort_out, Tmp_msg, Tmp_user, '
        +'Tmp_ActAl, DesAutoAl, PIN_Alarma, Auxiliar, Motorizado, ControlAforo, ReleCerradura,'
        +'TCerradura, ReleZumbador, TZumbador '
        +'FROM AccessCtrl14_ITACA.dbo.' +TBL_TERMINALES)

        if (result.recordset.length > 0) {
            const rows = result.recordset;

          } else {
            console.log('No se encontraron filas.');
          }

        pool.close();
        return await result.recordset
    } catch (error) {
        console.error('Error:', error);
    }


}
export async function borrarTerminal(ID){
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`DELETE FROM AccessCtrl14_ITACA.dbo.${TBL_TERMINALES} WHERE [idTerminal] = ${ID}`);
        
        if (result.rowsAffected[0] > 0) {
            alert(`Usuario con ID ${ID} eliminado exitosamente.`);
        } else {
            alert('No se encontró un usuario con ID ${ID}.');
        }

        pool.close();
        return result.rowsAffected[0];
    } catch (error) {
        console.error('Error:', error);
        return -1;
    }



}


export async function guardarTerminal(formData){

    
  try {

    const pool = await sql.connect(config);

    const result = await pool.request().query(`UPDATE AccessCtrl14_ITACA.dbo.${TBL_TERMINALES}
      SET 
        Presencia = ${formData.Presencia},
        Acceso = ${formData.Acceso},
        AntiPB = ${formData.AntiPB},
        FichajeMasivo = ${formData.FichajeMasivo},
        RegErrores = ${formData.RegErrores},
        LectorAux = ${formData.LectorAux},
        HorariosAux = ${formData.HorariosAux},
        AbreSiempreAux = ${formData.AbreSiempreAux},
        IP = '${formData.IP}',
        DesAutoAl = ${formData.DesAutoAl},
        ControlAforo = ${formData.ControlAforo},
        Auxiliar = ${formData.Auxiliar},
        Motorizado = ${formData.Motorizado},
        Cort_in = ${formData.Cort_in},
        Cort_out = ${formData.Cort_out},
        Tmp_msg = ${formData.Tmp_msg},
        Tmp_user = ${formData.Tmp_user},
        TCerradura = ${formData.TCerradura},
        Tmp_ActAl = ${formData.Tmp_ActAl},
        PIN_Alarma = ${formData.PIN_Alarma},
        ReleCerradura = ${formData.ReleCerradura},
        ReleZumbador = ${formData.ReleZumbador},
        TZumbador = ${formData.TZumbador} 
      WHERE idTerminal = ${formData.idTerminal}`);
    
      alert('Datos Actualizados')
  } catch (err) {
    alert("Error al actualizar datos:" + err)
  } finally {
    await sql.close();
  }

}






export async function queryCalendarios() {
    var pool =await sql.connect(config)
    try {
      const result = await pool.request()
        .query('SELECT [idCalendario], [Descripcion], [idHorarioL], [idHorarioM], [idHorarioX], [idHorarioJ], [idHorarioV], [idHorarioS], [idHorarioD] FROM [AccessCtrl14_ITACA].[dbo].' + TBL_CAL);
      return result.recordset;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

export async function insupdCalendario(data){
    console.log("activandose");
    console.log(data)
    async function gth(name) {
      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .query('SELECT idHorario FROM [AccessCtrl14_ITACA].[dbo].[Horario] WHERE [idHorario] = @name');
      return result.recordset[0].idHorario;
    }
  
    var pool = await sql.connect(config);
    try {
      const checkResult = await pool.request()
        .query('SELECT COUNT(*) as count FROM [AccessCtrl14_ITACA].[dbo].[Calendario] WHERE [idCalendario] = ' + data.idCalendario);
  
      const exists = checkResult.recordset[0].count > 0;
  
        console.log(exists)
      const lunesId = await gth(data.idHorarioL);
      const martesId = await gth(data.idHorarioM);
      const miercolesId = await gth(data.idHorarioX);
      const juevesId = await gth(data.idHorarioJ);
      const viernesId = await gth(data.idHorarioV);
      const sabadoId = await gth(data.idHorarioS);
      const domingoId = await gth(data.idHorarioD);
  
      if (exists) {
        // Actualizar si el ID ya existe
        await pool.request().query(`
        UPDATE [AccessCtrl14_ITACA].[dbo].[Calendario]
        SET 
          [Descripcion] = '${data.Descripcion}',
          [idHorarioL] = ${lunesId},
          [idHorarioM] = ${martesId},
          [idHorarioX] = ${miercolesId},
          [idHorarioJ] = ${juevesId},
          [idHorarioV] = ${viernesId},
          [idHorarioS] = ${sabadoId},
          [idHorarioD] = ${domingoId}
        WHERE [idCalendario] = ${data.idCalendario}
        `);
        alert('Datos de Calendario Actualizados');
      } else {
        // Insertar si el ID no existe
        await pool.request().query(`
        INSERT INTO [AccessCtrl14_ITACA].[dbo].[Calendario] 
        ([idCalendario], [Descripcion], [idHorarioL], [idHorarioM], [idHorarioX], [idHorarioJ], [idHorarioV], [idHorarioS], [idHorarioD])
        VALUES
        (${data.idCalendario}, '${data.Descripcion}', ${lunesId}, ${martesId}, ${miercolesId}, ${juevesId}, ${viernesId}, ${sabadoId}, ${domingoId})
        `);
        alert('Datos de Calendario Insertados');
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar los datos de calendario');
    } 

}