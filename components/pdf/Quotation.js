import React from "react";
import {Document, Page, StyleSheet, Text, View, Image, Font} from "@react-pdf/renderer";
import moment from "moment";

Font.register({
    family: 'Ubuntu',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/questrial/v13/QdVUSTchPBm7nuUeVf7EuStkm20oJA.ttf',
        },
    ],
});

Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
        page: {
            backgroundColor: '#ffffff',
            fontSize: 9,
            paddingTop: 30,
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: 10,
            fontFamily: 'Ubuntu'
        },
        container: {
            width: "98%",
            margin: "0 auto",
        },
        header: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 5,
        },
        body: {
            width: "100%",
            height: "100%",
            marginTop: 20,
            borderLeft: 1,
            borderRight: 1,
            borderColor: "#cbccce",
        },
        footer: {
            position: "fixed",
            bottom: 30,
            width: "100%",
            height: 100,   /* Height of the footer */
            borderBottom: 1,
            borderLeft: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            paddingBottom: 5

        },
        row: {
            flexDirection: "row",
        },
        rowBorder: {
            flexDirection: "row",
            borderBottom: 1,
            borderColor: "#cbccce",
            height: 35
        },
        title: {
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            textAlign: "center",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        titleBottom: {
            borderBottom: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        titleBottomCol6: {
            width: "50%",
            borderBottom: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",

        },
        currency: {
            borderBottom: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        currencySoft: {
            borderBottom: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        currencySoftNull: {
            width: "2%",
            borderBottom: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        titleBottom11: {
            textAlign: "right",
            width: "9%",
            borderBottom: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        titleLeft: {
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        titleLeftCol6: {
            width: "50%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",

        },
        titleRight: {
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            textAlign: "right",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        titleRight18: {
            width: "18%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 2,
            height: "auto",
            textAlign: "right",
            fontFamily: "Open Sans",
            fontWeight: 700
        },
        titleFooter: {
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            backgroundColor: "#e2e3e5",
            textAlign: "center",
            padding: 1,
            paddingTop: 3,
            height: 30,

        },
        text: {
            paddingLeft: 5,
            paddingTop: 2,
            marginBottom: 5,
            marginTop: 1
        },
        textBottom: {
            borderBottom: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textBottom11: {
            textAlign: "right",
            width: "9%",
            borderBottom: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textBottomCol4: {
            width: "33.33333333%",
            borderBottom: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRight: {
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRight5: {
            width: "3%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRight8: {
            width: "8%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRight9: {
            width: "9%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRight10: {
            textAlign: "right",
            width: "8%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRight11: {
            width: "13.6%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
            fontSize: "8px"

        },
        textRight12: {
            width: "12%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
            textAlign: "center"
        },
        textRight16: {
            width: "16.6%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
            textAlign: "center"
        },
        textRight15: {
            width: "15.4%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
            textAlign: "center"

        },
        textRight18: {
            width: "18%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
            textAlign: "center"

        },
        textRight21: {
            width: "21%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
            textAlign: "center"

        },
        textRight33: {
            width: "33.4%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRight71: {
            width: "71%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRightCol2: {
            width: "16.66666667%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textRightCol4: {
            width: "33.33333333%",
            borderBottom: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        textLeftRight: {
            borderBottom: 1,
            borderLeft: 1,
            borderRight: 1,
            borderColor: "#cbccce",
            padding: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: "auto",
        },
        col: {
            flex: "1 0",
        },
        col1: {
            width: "8.33333333%",
        },
        col2: {
            width: "16.66666667%",
        },
        col3: {
            width: "25%",
        },
        col4: {
            width: "33.33333333%",
        },
        col5: {
            width: "41.66666667%",
        },
        col6: {
            width: "50%",
        },
        col7: {
            width: "58.33333333%",
        },
        col8: {
            width: "66.66666667%",
        },
        col9: {
            width: "75%",
        },
        col10: {
            width: "83.33333333%",
        },
        col11: {
            width: "91.66666667%",
        },
        col12: {
            width: "100%",
        }

    })
;

export default function Quotation({data, settings, bankDetails, pdfTitle}) {
    let gross = 0;
    let net = 0;
    let total_gross = 0;
    let total_net = 0;
    let nullRows = [];
    let breakRowAndTotal = [];
    let endRow = [];
    let rowLength = 16;

    if (data.offerDetails.length > 16) {
        rowLength = rowLength + 36;
        for (let i = 0; i < 2; i++) {
            endRow.push(
                <View key={i} style={styles.row}> <Text> </Text> </View>
            )
        }
    }

    let rowLengthExtra = rowLength - data.offerDetails.length;
    for (let i = 0; i < rowLengthExtra; i++) {
        if (i === 25 - data.offerDetails.length) {
            nullRows.push(
                <View key={i} style={styles.rowBorder}> <Text> </Text> </View>
            )
        }
        nullRows.push(
            <View key={i} style={styles.row}>
                <Text style={styles.textRight5}> {i + data.offerDetails.length + 1}</Text>
                <Text style={styles.textRight11}></Text>
                <Text style={styles.textRight33}></Text>
                <Text style={styles.textRight12}></Text>
                <Text style={styles.textRight9}></Text>
                <Text style={styles.textRight8}></Text>
                <Text style={styles.currencySoftNull}></Text>
                <Text style={styles.textRight10}></Text>
                <Text style={styles.currencySoft}> {data.offerDetails[0].currency_unit} </Text>
                <Text style={styles.textBottom11}> 0,00 </Text>
            </View>
        )
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.row}>
                            <View style={styles.col8}>
                                <Image fixed cache={false} style={{width: "60%"}}
                                    // source={{uri: `${process.env.NEXT_PUBLIC_URL}${settings.settings.logo}`}}
                                       source={{uri: `${process.env.NEXT_PUBLIC_URL}public/${settings.settings.logo}`}}
                                />
                                <Text style={{paddingLeft: "1%"}}>Committed to Quality...</Text>
                            </View>
                            <View style={styles.col4}>
                                <View style={styles.col12}>
                                    <Text style={styles.title}>{pdfTitle}</Text>
                                </View>
                                <View style={styles.row}>
                                    <View style={styles.col4}>
                                        <Text style={styles.textLeftRight}> Date</Text>
                                    </View>
                                    <View style={styles.col8}>
                                        <Text style={styles.textRight}> {moment(data.offer_date).format('DD.MM.YYYY')}</Text>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <View style={styles.col4}>
                                        <Text style={styles.textLeftRight}> {pdfTitle === 'PROFORMA' ? 'Proforma' : 'Quotation'} No</Text>
                                    </View>
                                    <View style={styles.col8}>
                                        <Text style={styles.textRight}> {data.offer_code}{data.revised_code ? "-" + data.revised_code : ""}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.body}>
                        <View style={styles.row}>
                            <View style={styles.col12}>
                                <View style={styles.row}>
                                    <Text style={styles.titleLeftCol6}> Company Information</Text>
                                    <Text style={styles.titleBottomCol6}> Payment and Shipping Details</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Company Name</Text>
                                    <Text style={styles.textRightCol4}> {data.customer_trade_name}</Text>
                                    <Text style={styles.textRightCol2}> Payment Term</Text>
                                    <Text style={styles.textBottomCol4}> {data.payment}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Contact Person</Text>
                                    <Text
                                        style={styles.textRightCol4}> {data.authorized_person ? data.authorized_person : (data.customer.customerToOfficials.length > 0 ? data.customer.customerToOfficials[0].customerOfficial.name + " " + data.customer.customerToOfficials[0].customerOfficial.surname : "")}</Text>
                                    <Text style={styles.textRightCol2}> Shipped by</Text>
                                    <Text style={styles.textBottomCol4}> {data.shipped_by}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Address (Line1)</Text>
                                    <Text style={styles.textRightCol4}> {data.customerContactsInvoice.address}</Text>
                                    <Text style={styles.textRightCol2}> Delivery Term</Text>
                                    <Text style={styles.textBottomCol4}> {data.delivery_term}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Address (Line2)</Text>
                                    <Text
                                        style={styles.textRightCol4}> {data.customerContactsInvoice.district_name === null ? "-" : data.customerContactsInvoice.district_name + "/ " + data.customerContactsInvoice.province_name + "/ " + data.customerContactsInvoice.country_name}</Text>
                                    <Text style={styles.textRightCol2}> Origin</Text>
                                    <Text style={styles.textBottomCol4}> {data.origin}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Phone</Text>
                                    <Text
                                        style={styles.textRightCol4}> {data.authorized_person_phone ? data.authorized_person_phone : (data.customer.customerToOfficials.length > 0 ? data.customer.customerToOfficials[0].customerOfficial.phone : "")}</Text>
                                    <Text style={styles.textRightCol2}> Validity</Text>
                                    <Text style={styles.textBottomCol4}> {data.validity}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Sales Person</Text>
                                    <Text
                                        style={styles.textRightCol4}> {data.customer.customerToUsers[0].user.name + " " + data.customer.customerToUsers[0].user.surname}</Text>
                                    <Text style={styles.textRightCol2}> Currency</Text>
                                    <Text style={styles.textBottomCol4}> {(() => {
                                        if (data.currency_unit == "₺") {
                                            return (<> TL</>)
                                        } else if (data.currency_unit == "$") {
                                            return (<> USD</>)
                                        } else if (data.currency_unit == "€") {
                                            return (<> EURO</>)
                                        }
                                    })()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.col12}>
                            <Text style={{height: "14px"}}></Text>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.col12}>
                                <View style={styles.row}>
                                    <View style={{width: "3%"}}>
                                        <Text style={styles.title}>No</Text>
                                    </View>
                                    <View style={{width: "13.6%"}}>
                                        <Text style={styles.title}>Part No</Text>
                                    </View>
                                    <View style={{width: "33.4%"}}>
                                        <Text style={styles.title}>Description</Text>
                                    </View>
                                    <View style={{width: "12%"}}>
                                        <Text style={styles.title}>Origin</Text>
                                    </View>
                                    <View style={{width: "9%"}}>
                                        <Text style={styles.title}>Availability</Text>
                                    </View>
                                    <View style={{width: "8%"}}>
                                        <Text style={styles.title}>Quantity</Text>
                                    </View>
                                    <View style={{width: "10%"}}>
                                        <Text style={styles.title}>Unit Price</Text>
                                    </View>
                                    <View style={{width: "11%"}}>
                                        <Text style={styles.titleBottom}>Total</Text>
                                    </View>
                                </View>

                                {data.offerDetails.map((i, index) => {
                                    gross = parseFloat((i.products[0].kilogram) * (i.quantity))
                                    net = parseFloat(gross - ((gross * 10) / 100))
                                    total_gross += gross
                                    total_net += net
                                    breakRowAndTotal.push(
                                        <View style={styles.row}>
                                            <Text style={styles.textRight5}> {index + 1}</Text>
                                            <Text style={styles.textRight11}> {i.products[0].product_code}</Text>
                                            <Text style={styles.textRight33}> {i.products[0].product_desc}</Text>
                                            <Text style={styles.textRight12}> {i.products[0]["brand"].brand_name}</Text>
                                            <Text style={styles.textRight9}> {i.availability}</Text>
                                            <Text style={styles.textRight8}> {Math.abs(i.quantity)}</Text>
                                            <Text style={styles.currencySoft}> {i.currency_unit} </Text>
                                            <Text style={styles.textRight10}>
                                                {((parseFloat(i.unit_price) - (parseFloat(i.discount_amount) / parseFloat(Math.abs(i.quantity)))) + (parseFloat(i.vat_amount) / parseFloat(Math.abs(i.quantity)))).format(2, 3, '.', ',')}</Text>
                                            <Text style={styles.currencySoft}> {i.currency_unit} </Text>
                                            <Text style={styles.textBottom11}>{parseFloat(i.total).format(2, 3, '.', ',')}</Text>
                                        </View>
                                    )
                                    if (index === 24) {
                                        breakRowAndTotal.push(
                                            <View key={i} style={styles.rowBorder}> <Text> </Text> </View>
                                        )
                                    }
                                    // return (
                                    //     <>
                                    //         <View style={styles.row}>
                                    //             <Text style={styles.textRight5}> {index + 1}</Text>
                                    //             <Text style={styles.textRight11}> {i.products[0].product_code}</Text>
                                    //             <Text style={styles.textRight33}> {i.products[0].product_desc}</Text>
                                    //             <Text style={styles.textRight12}> {i.products[0]["brand"].brand_name}</Text>
                                    //             <Text style={styles.textRight9}> {i.availability}</Text>
                                    //             <Text style={styles.textRight8}> {Math.abs(i.quantity)}</Text>
                                    //             <Text style={styles.currencySoft}> {i.currency_unit} </Text>
                                    //             <Text style={styles.textRight10}>
                                    //                 {((parseFloat(i.unit_price) - (parseFloat(i.discount_amount) / parseFloat(Math.abs(i.quantity)))) + (parseFloat(i.vat_amount) / parseFloat(Math.abs(i.quantity)))).format(2, 3, '.', ',')}</Text>
                                    //             <Text style={styles.currencySoft}> {i.currency_unit} </Text>
                                    //             <Text style={styles.textBottom11}>{parseFloat(i.total).format(2, 3, '.', ',')}</Text>
                                    //         </View>
                                    //     </>
                                    // )

                                })}
                                {breakRowAndTotal}
                                {nullRows}
                            </View>
                        </View>

                        <View style={styles.col12}>
                            <View style={styles.row}>
                                <View style={{width: "16.6%"}}>
                                    <Text style={styles.title}>Mode of Transport</Text>
                                </View>
                                <View style={{width: "18%"}}>
                                    <Text style={styles.title}>Number of Packages</Text>
                                </View>
                                <View style={{width: "15.4%"}}>
                                    <Text style={styles.title}>Total Gross Weight</Text>
                                </View>
                                <View style={{width: "21%"}}>
                                    <Text style={styles.title}>Type of Packaging </Text>
                                </View>
                                <Text style={styles.titleRight18}>SUBTOTAL</Text>
                                <Text style={styles.currency}> {data.currency_unit} </Text>
                                <Text style={styles.titleBottom11}>{parseFloat(data.subtotal).format(2, 3, '.', ',')}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.textRight16}>{data.transport}</Text>
                                <Text style={styles.textRight18}>{data.number_of_packages}</Text>
                                <Text style={styles.textRight15}>{total_gross.toFixed(2)} kg</Text>
                                <Text style={styles.textRight21}>{data.type_of_packaging}</Text>
                                <Text style={styles.titleRight18}>SHIPPING COST</Text>
                                <Text style={styles.currency}> {data.currency_unit} </Text>
                                <Text style={styles.titleBottom11}>{parseFloat(data.shipping_total_cost).format(2, 3, '.', ',')}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.textRight71}></Text>
                                <Text style={styles.titleRight18}>TOTAL</Text>
                                <Text style={styles.currency}> {data.currency_unit} </Text>
                                <Text style={styles.titleBottom11}>{parseFloat(data.overall_total).format(2, 3, '.', ',')}</Text>
                            </View>0
                        </View>
                    </View>
                    {endRow}
                    <View style={styles.footer}>
                        <Text style={styles.titleFooter}>{settings.settings.trade_name} (www.crmlimited.com)</Text>
                        <View style={styles.row}>
                            <View style={{width: "28%", borderRight: 1, borderColor: "#cbccce"}}>
                                <View style={{marginBottom: "2%"}}>
                                    <Text style={styles.text}>Address:</Text>
                                    <Text style={styles.text}>{settings.settings.address} </Text>
                                </View>
                                <View style={{marginTop: "2%"}}>
                                    <Text style={styles.text}>Phone:</Text>
                                    <View style={styles.row}>
                                        <Text style={styles.text}>{settings.settings.first_phone} /</Text>
                                        <Text style={styles.text}>{settings.settings.second_phone}</Text>
                                    </View>
                                </View>
                                <View style={{marginTop: "2%"}}>
                                    <Text style={styles.text}>{settings.settings.email}</Text>
                                </View>
                            </View>
                            <View style={{width: "44%", borderRight: 1, borderColor: "#cbccce"}}>
                                <View style={styles.row}>
                                    <View style={styles.col4}>
                                        <Text style={styles.text}>Bank Name:</Text>
                                        <Text style={styles.text}>Bank Branch:</Text>
                                        <Text style={styles.text}>Swift Code:</Text>
                                        <Text style={styles.text}>USD IBAN NO:</Text>
                                        <Text style={styles.text}>EURO IBAN NO:</Text>
                                    </View>
                                    <View style={styles.col8}>
                                        <Text style={styles.text}>{bankDetails.bank_name}</Text>
                                        <Text style={styles.text}>{bankDetails.bank_branch}</Text>
                                        <Text style={styles.text}>{bankDetails.swift_code}</Text>
                                        <Text style={styles.text}>{bankDetails.usd_iban_no}</Text>
                                        <Text style={styles.text}>{bankDetails.euro_iban_no}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: "28%", paddingTop: "15px"}}>
                                <Image fixed cache={false} style={{objectFit: "contain"}}
                                       source={{uri: `${process.env.NEXT_PUBLIC_URL}public/${settings.settings.signature}`}}/>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
