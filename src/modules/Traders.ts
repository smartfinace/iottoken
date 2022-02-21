import { connect } from '../database'

const getOrders = async function(limit:number=8,page:number=1, search:any=""){
    var sql = "";
    try {
    const conn = await connect();
    if(search == ""){
        sql = "SELECT *, DATE_FORMAT(opentime, '%d-%m-%Y %H:%i') as opentime FROM trader_signals  GROUP BY telegram_id ORDER BY id DESC LIMIT "+limit;
    }else{
        sql = "SELECT *, DATE_FORMAT(opentime, '%d-%m-%Y %H:%i') as opentime FROM trader_signals   WHERE symbol LIKE '%"+search+"%' AND close IS NULL GROUP BY telegram_id ORDER BY id DESC LIMIT "+limit;
    }
    const [rows, fields] = await conn.query(sql)  as any;
    
    return rows;
    }
    catch (e) {
        return [];
    }
    //res.json(posts[0]);
}

const getOrdersFinish = async function(){
    try {
    const conn = await connect();
    const [rows, fields] = await conn.query("SELECT *, DATE_FORMAT(opentime, '%d-%m %H:%i') as opentime, DATE_FORMAT(close_time, '%d-%m %H:%i') as closetime FROM trader_signals_finish  ORDER BY close_time DESC LIMIT 10")  as any;
    return rows;
    }
    catch (e) {
        return [];
    }
    //res.json(posts[0]);
}


const getOrdersInfo = async (id:number=0) =>{
    try {
        const conn = await connect();
        let mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
        const [rows, fields] = await conn.query("SELECT *, DATE_FORMAT(opentime, '%Y-%m-%d %H:%i:%s') as opentime FROM trader_signals WHERE id='"+id+"' LIMIT 1")  as any;
        return rows[0];
    }
    catch (e) {
        return {};
    }
    return true;
    
}

const createOrders = async function(obj = {symbol : "", type : "", open : 0, open_2 : 0, open_3 : 0, sl : 0, tp : 0, tp_2 : 0, tp_3 : 0, message_id : 0, tf : "", chart : ""}) {
    try {
        const conn = await connect();
        await conn.query('INSERT INTO trader_signals SET symbol="'+obj.symbol+'", type="'+obj.type+'", open="'+obj.open+'", open_2="'+obj.open_2+'", open_3="'+obj.open_3+'", sl="'+obj.sl+'", tp="'+obj.tp+'", tp_2="'+obj.tp_2+'", tp_3="'+obj.tp_3+'", telegram_id="'+obj.message_id+'", timefream="'+obj.tf+'", chart="'+obj.chart+'"');
        return true;
    }
    catch (e) {
        return false;
    }
    return true;
}

const deleteOrders = async function(obj = {id : 0}) {
    try {
    const conn = await connect();
    await conn.query('DELETE FROM trader_signals WHERE id="'+obj.id+'"');
    return true;
    }
    catch (e) {
        return true;
    }
    return true;
}

const closeOrders = async function(obj = {signals_id: 0, symbol : "", open : 0, opentime : "", sl : 0, message_id : 0, close : "", pip : 0, close_type : "Close", is_access : "", action : "", method_hit : 0}) {
    try {
        
        const conn = await connect();
        let mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
        await conn.query("INSERT INTO trader_signals_finish SET signals_id='"+obj.signals_id+"', symbol ='"+obj.symbol+"', open ='"+obj.open+"', opentime ='"+obj.opentime+"', sl='"+obj.sl+"', close_at='"+obj.close+"', close_time='"+mysqlDate+"', close_type='"+obj.close_type+"', profit_pip='"+obj.pip+"', telegram_id='"+obj.message_id+"', is_access='"+obj.is_access+"'");
        
        if(obj.close_type == "TP" || (obj.close_type == "Close" && obj.pip > 0)){
            await conn.query("UPDATE trader_signals SET tp_hit='"+obj.method_hit+"' WHERE id='"+obj.signals_id+"'");

            const [rows, fields] = await conn.query("SELECT * FROM trader_report WHERE id='1'")  as any;
            const reportData = rows[0];
            var tp_total_pips = parseFloat(reportData.tp_total_pips).toFixed(2) + parseFloat(obj.pip).toFixed(2);
            var tp_total_vip_pips = reportData.tp_total_vip_pips;
            var tp_total = reportData.tp_total + 1;
            if(obj.method_hit > 1){
                tp_total_vip_pips = tp_total_vip_pips + obj.pip;
            }
            await conn.query("UPDATE trader_report SET tp_total_pips='"+tp_total_pips+"', tp_total_vip_pips='"+tp_total_vip_pips+"', tp_total='"+tp_total+"' WHERE id='1'");

        }

        if(obj.close_type == "SL" || (obj.close_type == "Close" && obj.pip < 0)){
            const [rows, fields] = await conn.query("SELECT * FROM trader_report WHERE id='1'")  as any;
            const reportData = rows[0];
            var sl_total = reportData.sl_total + 1;
            var sl_total_pips = parseFloat(reportData.sl_total_pips).toFixed(2) + parseFloat(obj.pip).toFixed(2);
            await conn.query("UPDATE trader_report SET sl_total='"+sl_total+"', sl_total_pips='"+sl_total_pips+"' WHERE id='1'");


        }

        if(obj.action == "remove"){
            await deleteOrders({id : obj.signals_id});
        }
        return true;
    }
    catch (e) {
        console.log(e)
    }
    return true;
    
}

const getSymbols = async () =>{
    try {
        const conn = await connect();
        let mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
        const [rows, fields] = await conn.query("SELECT * FROM trader_symbols ORDER BY symbol DESC LIMIT 100")  as any;
        return rows;
    }
    catch (e) {
        console.log(e)
    }
    return true;
    
}

const getSymbolsInfo = async (symbol="") =>{
    try {
        const conn = await connect();
        let mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
        const [rows, fields] = await conn.query("SELECT * FROM trader_symbols WHERE symbol='"+symbol+"' ORDER BY symbol DESC LIMIT 1")  as any;
        return rows[0];
    }
    catch (e) {
        return [];
    }
    return true;
    
}

const getReport = async () =>{
    try {
        const conn = await connect();
        
        const [rows, fields] = await conn.query("SELECT *, (tp_total_pips - tp_total_vip_pips) as tp_total_free_pips, (sl_total + tp_total) as finish_total, (stock_symbol + forex_symbol + crypto_symbol) as symbol_total, (SELECT COUNT(*) FROM trader_signals) as wait_orders FROM trader_report WHERE id='1'")  as any;
        return rows[0];
    }
    catch (e) {
        console.log(e)
    }
    return true;
    
}

export default {getOrders, getOrdersInfo, getOrdersFinish,createOrders,deleteOrders,closeOrders,getSymbols, getSymbolsInfo, getReport};

