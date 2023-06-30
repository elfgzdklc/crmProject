import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const Sales = require("../models/sales");

export default async (req, res) => {
    const nowTime = new Date().getTime();
    let tokenSession = null;

    try {
        tokenSession = await decode({
            token: req?.headers?.authtoken ?? '',
            secret: process.env.SECRET
        });
    } catch (e) {
        console.log(e.message)
    }
    // 401 Unauthorized if auth token is not null, or the expiration token is minor than actual time
    if (!tokenSession || tokenSession.exp > nowTime) {
        res.status(401).json({error: "Yetkisiz giriş"})
    } else {
        let sum=0;
        let sumEuro=0;
        let sumDolar=0;
        const totalSales=await Sales.findAll({
            attributes: ['overall_total'],
        });
        for (let i=0;i<totalSales.length;i++){
            let totalValue=totalSales[i].overall_total
            sum=sum+parseFloat(totalValue)
        }
        const euroTotalSales=await Sales.findAll({
            attributes:['overall_total'],
            where:{
                currency_unit:'€'
            }
        })
        for (let i=0;i<euroTotalSales.length;i++){
            let totalValueEuro=euroTotalSales[i].overall_total
            sumEuro=sumEuro+parseFloat(totalValueEuro)
        }
        const dolarTotalSales=await Sales.findAll({
            attributes:['overall_total'],
            where:{
                currency_unit:'$'
            }
        })
        for (let i=0;i<dolarTotalSales.length;i++){
            let totalValueDolar=dolarTotalSales[i].overall_total
            sumDolar=sumDolar+parseFloat(totalValueDolar)
        }
        if (totalSales){
            res.json({
                euroTotalSales:sumEuro,
                dolarTotalSales:sumDolar
            })
        }else{
            res.json({
                message:"Satış yok."
            })
        }
    }
}