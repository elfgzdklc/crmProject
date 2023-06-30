import {Sequelize, Op} from "sequelize";
import {decode} from "next-auth/jwt";
const Customers=require('../models/customers');
const Offers=require('../models/offers');
const Users=require('../models/users');
const CustomerToUsers=require('../models/customerToUser');
const Sales = require("../models/sales");
const CustomerToUser = require("../models/customerToUser");

Offers.hasOne(Users, {
    sourceKey: 'user_id',
    foreignKey: 'id'
});
CustomerToUser.hasOne(Users, {
    sourceKey: 'assigned_user_id',
    foreignKey: 'id'
});
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
        const start = req.body.created_at;
        const end = req.body.created_at2;
        const user_id=req.body.user_name;
        let totalCustomers;
        let activeCustomers;
        let potentialCustomers;
        let totalOffer;
        let approvedOffer;
        let rejectedOffer;
        let waitingOffer;
        let totalSales;
        let income;
        let sum=0;
        let totalRealizedSales;
        let totalPendingSales;
        let totalCanceledOffer;
        let potentailCustomerUserArray = [];
        let salesUserArray=[];
        let customerUserArray = [];
        let offerApprovedUserArray = [];
        let offerRejectedUserArray = [];
        let offerWaitUserArray=[];
        let offerCanceledUserArray = [];
        let euroTotalSales;
        let dolarTotalSales;
        let sumEuro=0;
        let sumDolar=0;
        const allUser=await Users.findAll();
        if (user_id){
            totalSales=await Sales.findAll({
                where:{
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    user_id:user_id
                }
            });
            totalCustomers = await CustomerToUsers.findAll({
                where: {
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    assigned_user_id:user_id
                }
            });
             activeCustomers = await CustomerToUsers.findAll({
                 where: {
                     created_at: {
                         [Op.between]: [start, end]
                     },
                     customer_type:"Firma",
                     assigned_user_id:user_id
                 }
             });
            potentialCustomers = await CustomerToUsers.findAll({
                where: {
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    customer_type:"Potansiyel Firma",
                    assigned_user_id:user_id
                }
            });
            totalOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                    user_id:user_id,
                }
            })
            approvedOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                    status:1,
                    user_id:user_id
                }
            })
            rejectedOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                    status:2,
                    user_id:user_id
                }
            })
            waitingOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                    status:0,
                    user_id:user_id
                }
            })
            income=await Sales.findAll({
                attributes: ['overall_total'],
                where: {
                    created_at: {
                        [Op.between]:[start,end]
                    },
                    user_id:user_id
                }
            });
            for (let i=0;i<totalSales.length;i++){
                let totalValue=totalSales[i].overall_total
                sum=sum+parseFloat(totalValue)
            }
            totalRealizedSales= await Sales.findAll(
                {
                    where: {
                        created_at: {
                            [Op.between]: [start, end]
                        },
                        status:1,
                        user_id:user_id,
                    }
                }
            );
            totalPendingSales=await Sales.findAll(
                {
                    where: {
                        created_at: {
                            [Op.between]: [start, end]
                        },
                        status:0,
                        user_id:user_id,
                    }
                }
            );
            totalCanceledOffer=await Offers.findAll(
                {
                    where: {
                        created_at: {
                            [Op.between]: [start, end]
                        },
                        status:3,
                        user_id:user_id,
                    }
                }
            )
            euroTotalSales=await Sales.findAll({
                attributes:['overall_total'],
                where:{
                    currency_unit:'€',
                    user_id:user_id,
                }
            })
            for (let i=0;i<euroTotalSales.length;i++){
                let totalValueEuro=euroTotalSales[i].overall_total
                sumEuro=sumEuro+parseFloat(totalValueEuro)
            }
            dolarTotalSales=await Sales.findAll({
                attributes:['overall_total'],
                where:{
                    currency_unit:'$',
                    user_id:user_id,
                }
            })
            for (let i=0;i<dolarTotalSales.length;i++){
                let totalValueDolar=dolarTotalSales[i].overall_total
                sumDolar=sumDolar+parseFloat(totalValueDolar)
            }
        }
        else{
            totalSales=await Sales.findAll({
                where:{
                    created_at: {
                        [Op.between]: [start, end]
                    },
                }
            });
             totalCustomers = await Customers.findAll({
                 where: {
                     created_at: {
                         [Op.between]: [start, end]
                     },
                 }
             });
             activeCustomers = await Customers.findAll({
                 where: {
                     created_at: {
                         [Op.between]: [start, end]
                     },
                     type:0
                 }
             });
            potentialCustomers = await Customers.findAll({
                where: {
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    type:1
                }
            });
            totalOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                }
            })
            approvedOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                    status:1
                }
            })
            rejectedOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                    status:2
                }
            })
            waitingOffer=await Offers.findAll({
                where:{
                    created_at:{
                        [Op.between]:[start,end]
                    },
                    status:0
                }
            })
            income=await Sales.findAll({
                attributes: ['overall_total'],
                where: {
                    created_at: {
                        [Op.between]:[start,end]
                    },
                }
            });
            for (let i=0;i<totalSales.length;i++){
                let totalValue=totalSales[i].overall_total
                sum=sum+parseFloat(totalValue)
            }
            totalRealizedSales= await Sales.findAll({
                where: {
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    status:1,
                }
            });
            totalPendingSales=await Sales.findAll({
                where: {
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    status:0,
                }
            });
            totalCanceledOffer=await Offers.findAll({
                where: {
                    created_at: {
                        [Op.between]: [start, end]
                    },
                    status:3
                }
            });
            for (let i = 0; i < allUser.length; i++) {
                const customerToUser = await CustomerToUser.count({
                    include: [{
                        as : 'user',
                        model: Users
                    }],
                    where: {
                        customer_type: "Firma",
                        assigned_user_id: allUser[i].id,
                        created_at: {
                            [Op.between]: [start, end]
                        }
                    }
                })
                customerUserArray.push(customerToUser)
            }
            for (let i = 0; i < allUser.length; i++) {
                const potentialCustomerToUser = await CustomerToUser.count({
                    include: [{
                        as : 'user',
                        model: Users
                    }],
                    where: {
                        customer_type: "Potansiyel Firma",
                        assigned_user_id: allUser[i].id,
                        created_at: {
                            [Op.between]: [start, end]
                        }
                    }
                })
                potentailCustomerUserArray.push(potentialCustomerToUser)
            }
            for (let i=0; i <allUser.length; i++){
                const  totalSales=await Sales.count({
                    where:{
                        created_at: {
                            [Op.between]: [start, end]
                        },
                        user_id:allUser[i].id
                    }
                })
                salesUserArray.push(totalSales)
            }
            for (let i = 0; i < allUser.length; i++) {
                const offerApprovedToUser = await Offers.count({
                    include: [{
                        as:'user',
                        model: Users
                    }],
                    where: {
                        status: 1,
                        user_id: allUser[i].id,
                        created_at: {
                            [Op.between]: [start, end]
                        },
                    }
                })
                offerApprovedUserArray.push(offerApprovedToUser)
            }
            for (let i = 0; i < allUser.length; i++) {
                const offerRejectedToUser = await Offers.count({
                    include: [{
                        as: 'user',
                        model: Users
                    }],
                    where: {
                        status: 2,
                        user_id: allUser[i].id,
                        created_at: {
                            [Op.between]: [start, end]
                        },
                    }
                })
                offerRejectedUserArray.push(offerRejectedToUser)
            }
            for (let i = 0; i < allUser.length; i++) {
                const offerWaitToUser = await Offers.count({
                    include: [{
                        as:'user',
                        model: Users
                    }],
                    where: {
                        status: 0,
                        user_id: allUser[i].id,
                        created_at: {
                            [Op.between]: [start, end]
                        },
                    }
                })
                offerWaitUserArray.push(offerWaitToUser)
            }
            for (let i = 0; i < allUser.length; i++) {
                const offerCanceledToUser = await Offers.count({
                    include: [{
                        as: 'user',
                        model: Users
                    }],
                    where: {
                        status: 3,
                        user_id: allUser[i].id,
                        created_at: {
                            [Op.between]: [start, end]
                        },
                    }
                })
                offerCanceledUserArray.push(offerCanceledToUser)
            }
            euroTotalSales=await Sales.findAll({
                attributes:['overall_total'],
                where:{
                    currency_unit:'€',
                    created_at: {
                        [Op.between]: [start, end]
                    },
                }
            })
            for (let i=0;i<euroTotalSales.length;i++){
                let totalValueEuro=euroTotalSales[i].overall_total
                sumEuro=sumEuro+parseFloat(totalValueEuro)
            }
            dolarTotalSales=await Sales.findAll({
                attributes:['overall_total'],
                where:{
                    currency_unit:'$',
                    created_at: {
                        [Op.between]: [start, end]
                    },
                }
            })
            for (let i=0;i<dolarTotalSales.length;i++){
                let totalValueDolar=dolarTotalSales[i].overall_total
                sumDolar=sumDolar+parseFloat(totalValueDolar)
            }
        }
        if (totalCustomers) {
            res.json({
                data: totalCustomers.length,
                activeCustomers:activeCustomers.length,
                potentialCustomers:potentialCustomers.length,
                totalOffer:totalOffer.length,
                approvedOffer:approvedOffer.length,
                rejectedOffer:rejectedOffer.length,
                waitingOffer:waitingOffer.length,
                totalSales:totalSales.length,
                allUser:allUser,
                monthIncome:sum,
                totalRealizedSales:totalRealizedSales.length,
                totalPendingSales:totalPendingSales.length,
                totalCanceledOffer:totalCanceledOffer.length,
                customerToUser: customerUserArray,
                potentialCustomerToUser: potentailCustomerUserArray,
                salesToUser:salesUserArray,
                offerApprovedToUser2: offerApprovedUserArray,
                offerRejectedToUser2: offerRejectedUserArray,
                offerWaitToUser2:offerWaitUserArray,
                offerCanceledToUser2:offerCanceledUserArray,
                euroTotalSalesSelect:sumEuro,
                dolarTotalSalesSelect:sumDolar
            });
        } else {
            res.json({
                status: false,
                message: "Firma bu aralıkta bulunamadı"
            });
        }
    }
}