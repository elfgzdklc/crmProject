import React from "react";
import moment from "moment";
import {
    Document as PdfDocument,
    Page as PdfPage,
    StyleSheet, Text, View, Image, Font
} from '@react-pdf/renderer';

Font.register({
    family: 'Ubuntu',
    fonts: [
        {
            src: 'https://fonts.gstatic.com/s/questrial/v13/QdVUSTchPBm7nuUeVf7EuStkm20oJA.ttf',
        },
        {
            src: 'https://fonts.gstatic.com/s/questrial/v13/QdVUSTchPBm7nuUeVf7EuStkm20oJA.ttf',
            fontWeight: 'bold',
        },
        {
            src: 'https://fonts.gstatic.com/s/questrial/v13/QdVUSTchPBm7nuUeVf7EuStkm20oJA.ttf',
            fontWeight: 'normal',
            fontStyle: 'italic',
        },
    ],
});
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        fontSize: 9,
        paddingTop: 30,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        fontFamily: 'Ubuntu',
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
        bottom: 10,
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
        height: 45
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
        paddingTop: 3.5,
        paddingBottom: 3.5,
        height: "auto",
        fontFamily: "Open Sans",
        fontWeight: 800

    },
    titleFooter: {
        borderBottom: 1,
        borderRight: 1,
        borderColor: "#cbccce",
        backgroundColor: "#e2e3e5",
        textAlign: "center",
        padding: 1,
        paddingTop: 5,
        paddingBottom: 10,
        height: "auto",

    },
    text: {
        paddingLeft: 5,
        paddingTop: 2,
        marginBottom: 1,
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
    textBottom10: {
        width: "10%",
        borderBottom: 1,
        borderColor: "#cbccce",
        padding: 1,
        paddingTop: 5,
        paddingBottom: 5,
        height: "auto",
    },
    textBottom25: {
        width: "25%",
        borderBottom: 1,
        borderColor: "#cbccce",
        padding: 1,
        paddingTop: 5,
        paddingBottom: 5,
        height: "auto",
        textAlign: "center"
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
    textRight25: {
        width: "25%",
        borderBottom: 1,
        borderRight: 1,
        borderColor: "#cbccce",
        padding: 1,
        paddingTop: 5,
        paddingBottom: 5,
        height: "auto",
        textAlign: "center"
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
        width: "10%",
        borderBottom: 1,
        borderRight: 1,
        borderColor: "#cbccce",
        padding: 1,
        paddingTop: 5,
        paddingBottom: 5,
        height: "auto",
    },
    textRight11: {
        width: "11%",
        borderBottom: 1,
        borderRight: 1,
        borderColor: "#cbccce",
        padding: 1,
        paddingTop: 5,
        paddingBottom: 5,
        height: "auto",
    },
    textRight116: {
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
    textLeftRight: {
        borderBottom: 1,
        borderLeft: 1,
        borderRight: 1,
        borderColor: "#cbccce",
        padding: 1,
        paddingTop: 5,
        height: 20,
    },
    textAll: {
        border: 1,
        borderColor: "#cbccce",
        padding: 1,
        paddingTop: 5,
        paddingBottom: 5,
        height: "auto",
    },
    textTop: {
        borderBottom: 1,
        borderTop: 1,
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

});

export default function PackingList({data, settings}) {
    let gross = 0;
    let net = 0;
    let sumQuantity = "";
    let arrQuantity = [];
    let total_gross = 0;
    let total_net = 0;
    let nullRows = [];
    let breakRowAndTotal = [];
    let rowLength = 16;

    if (data.salesDetails.length > 16) {
        rowLength = rowLength + 36;
    }

    let rowLengthExtra = rowLength - data.salesDetails.length;
    for (let i = 0; i < rowLengthExtra; i++) {
        if (i === 25 - data.salesDetails.length) {
            nullRows.push(
                <View key={i} style={styles.rowBorder}> <Text> </Text> </View>
            )
        }
        nullRows.push(
            <View key={i} style={styles.row}>
                <Text style={styles.textRight5}> {i + data.salesDetails.length + 1}</Text>
                <Text style={styles.textRight116}></Text>
                <Text style={styles.textRight33}></Text>
                <Text style={styles.textRight12}></Text>
                <Text style={styles.textRight9}></Text>
                <Text style={styles.textRight8}></Text>
                <Text style={styles.textRight11}></Text>
                <Text style={styles.textBottom10}></Text>
            </View>
        )
    }
    return (
        <PdfDocument>
            <PdfPage size="A4" style={styles.page}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.row}>
                            <View style={styles.col8}>
                                <Image fixed cache={false} style={{width: "50%"}}
                                    //    source={{uri: `${process.env.NEXT_PUBLIC_URL}${settings.settings.logo}`}}
                                    source={{uri: `${process.env.NEXT_PUBLIC_URL}public/${settings.settings.logo}`}}
                                />
                                <Text style={{paddingLeft: "1%"}}>Committed to Quality...</Text>
                            </View>
                            <View style={styles.col4}>
                                <View style={styles.row}>
                                    <View style={styles.col4}>
                                        <Text style={styles.textAll}> Invoice Date </Text>
                                    </View>
                                    <View style={styles.col8}>
                                        <Text style={styles.textTop}> {data.invoice_date ? moment(data.invoice_date).format('DD.MM.YYYY') : "-"}</Text>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <View style={styles.col4}>
                                        <Text style={styles.textLeftRight}> Invoice No</Text>
                                    </View>
                                    <View style={styles.col8}>
                                        <Text style={styles.textRight}> {data.invoice_no ? data.invoice_no : "-"}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.col12}>
                        <Text style={{fontSize: "18px", textAlign: "center", marginTop: 4}}>PACKING LIST</Text>
                    </View>
                    <View style={styles.body}>
                        <View style={styles.row}>
                            <View style={styles.col12}>
                                <View style={styles.row}>
                                    <Text style={styles.titleLeftCol6}> Company Information</Text>
                                    <Text style={styles.titleBottomCol6}> Consignee (Ship to)</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Company Name</Text>
                                    <Text style={styles.textRightCol4}> {data.customer_trade_name}</Text>
                                    <Text style={styles.textRightCol2}> Company Name</Text>
                                    <Text
                                        style={styles.textBottomCol4}> {data.customerContactsInvoice.id !== data.customerContactsShipment.id ? data.customer_trade_name : ""}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Contact Person</Text>
                                    <Text
                                        style={styles.textRightCol4}> {data.authorized_person ? data.authorized_person : (data.customer.customerToOfficials.length > 0 ? data.customer.customerToOfficials[0].customerOfficial.name + " " + data.customer.customerToOfficials[0].customerOfficial.surname : "")}</Text>
                                    <Text style={styles.textRightCol2}> Contact Person</Text>
                                    <Text
                                        style={styles.textBottomCol4}> {data.customerContactsInvoice.id !== data.customerContactsShipment.id ? (data.authorized_person ? data.authorized_person : (data.customer.customerToOfficials.length > 0 ? data.customer.customerToOfficials[0].customerOfficial.name + " " + data.customer.customerToOfficials[0].customerOfficial.surname : "")) : ""}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Address (Line1)</Text>
                                    <Text style={styles.textRightCol4}> {data.customerContactsInvoice.address}</Text>
                                    <Text style={styles.textRightCol2}> Address (Line1)</Text>
                                    <Text
                                        style={styles.textBottomCol4}> {data.customerContactsInvoice.id !== data.customerContactsShipment.id ? data.customerContactsShipment.address : ""}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Address (Line2)</Text>
                                    <Text
                                        style={styles.textRightCol4}> {data.customerContactsInvoice.district_name == null ? "-" : data.customerContactsInvoice.district_name + "/ " + data.customerContactsInvoice.province_name + "/ " + data.customerContactsInvoice.country_name}</Text>
                                    <Text style={styles.textRightCol2}> Address (Line2)</Text>
                                    <Text
                                        style={styles.textBottomCol4}> {data.customerContactsInvoice.id !== data.customerContactsShipment.id ? (data.customerContactsShipment.district_name == null ? "-" : data.customerContactsShipment.district_name + "/ " + data.customerContactsShipment.province_name + "/ " + data.customerContactsShipment.country_name) : ""}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.textRightCol2}> Phone</Text>
                                    <Text
                                        style={styles.textRightCol4}> {data.authorized_person_phone ? data.authorized_person_phone : (data.customer.customerToOfficials.length > 0 ? data.customer.customerToOfficials[0].customerOfficial.phone : "")}</Text>
                                    <Text style={styles.textRightCol2}> Phone</Text>
                                    <Text
                                        style={styles.textBottomCol4}> {data.customerContactsInvoice.id !== data.customerContactsShipment.id ? (data.authorized_person_phone ? data.authorized_person_phone : (data.customer.customerToOfficials.length > 0 ? data.customer.customerToOfficials[0].customerOfficial.phone : "")) : ""}</Text>
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
                                        <Text style={styles.title}>Packaging</Text>
                                    </View>
                                    <View style={{width: "8%"}}>
                                        <Text style={styles.title}>Quantity</Text>
                                    </View>
                                    <View style={{width: "11%", fontSize: "8px"}}>
                                        <Text style={styles.title}>Gross Weight Kg</Text>
                                    </View>
                                    <View style={{width: "10%", fontSize: "8px"}}>
                                        <Text style={styles.titleBottom}> Net Weight Kg</Text>
                                    </View>
                                </View>
                                {data.salesDetails.map((i, index) => {
                                    arrQuantity.push(Math.abs(i.quantity))
                                    sumQuantity = arrQuantity.reduce((partialSum, a) => partialSum + a, 0)
                                    gross = parseFloat((i.products[0].kilogram) * (i.quantity))
                                    net = parseFloat(gross - ((gross * 10) / 100))
                                    total_gross += gross
                                    total_net += net
                                    breakRowAndTotal.push(
                                        <View style={styles.row}>
                                            <Text style={styles.textRight5}> {index + 1}</Text>
                                            <Text style={styles.textRight116}> {i.products[0].product_code}</Text>
                                            <Text style={styles.textRight33}> {i.products[0].product_desc}</Text>
                                            <Text style={styles.textRight12}> {i.products[0]["brand"].brand_name}</Text>
                                            <Text style={styles.textRight9}> {i.packaging}</Text>
                                            <Text style={styles.textRight8}> {Math.abs(i.quantity)}</Text>
                                            <Text
                                                style={styles.textRight11}> {Math.abs(gross).toFixed(2)}</Text>
                                            <Text style={styles.textBottom10}> {Math.abs(net).toFixed(2)}</Text>
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
                                    //             <Text style={styles.textRight116}> {i.products[0].product_code}</Text>
                                    //             <Text style={styles.textRight33}> {i.products[0].product_desc}</Text>
                                    //             <Text style={styles.textRight12}> {i.products[0]["brand"].brand_name}</Text>
                                    //             <Text style={styles.textRight9}> {i.packaging}</Text>
                                    //             <Text style={styles.textRight8}> {Math.abs(i.quantity)}</Text>
                                    //             <Text
                                    //                 style={styles.textRight11}> {Math.abs(gross).toFixed(2)}</Text>
                                    //             <Text style={styles.textBottom10}> {Math.abs(net).toFixed(2)}</Text>
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
                                <View style={{width: "71%"}}>
                                    <Text style={styles.titleRight}> TOTAL </Text>
                                </View>
                                <View style={{width: "8%"}}>
                                    <Text style={styles.titleLeft}> {sumQuantity} </Text>
                                </View>
                                <View style={{width: "11%"}}>
                                    <Text style={styles.titleLeft}> {Math.abs(total_gross).toFixed(2)}</Text>
                                </View>
                                <View style={{width: "10%"}}>
                                    <Text style={styles.titleBottom}> {Math.abs(total_net).toFixed(2)}</Text>
                                </View>
                            </View>
                            <View style={styles.col12}>
                                <Text style={{height: "14px"}}></Text>
                            </View>
                            <View style={styles.row}>
                                <View style={{width: "25%"}}>
                                    <Text style={styles.title}>Container No </Text>
                                </View>
                                <View style={{width: "25%"}}>
                                    <Text style={styles.title}>Vessel Name </Text>
                                </View>
                                <View style={{width: "25%"}}>
                                    <Text style={styles.title}>Carrier</Text>
                                </View>
                                <View style={{width: "25%"}}>
                                    <Text style={styles.title}> Delivery Type </Text>
                                </View>
                                <View style={{width: "25%", textAlign: "center"}}>
                                    <Text style={styles.titleBottom}>Delivery Term </Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.textRight25}> {data.container_no}</Text>
                                <Text style={styles.textRight25}> {data.vessel_name}</Text>
                                <Text style={styles.textRight25}> {data.shipped_by}</Text>
                                <Text style={styles.textRight25}> {data.delivery_type}</Text>
                                <Text style={styles.textBottom25}> {data.delivery_term}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.titleFooter}>{settings.settings.trade_name} (www.crmlimited.com)</Text>
                        <View style={styles.row}>
                            <View style={{width: "60%", borderRight: 1, borderColor: "#cbccce", textAlign: "center"}}>
                                <View>
                                    <Text style={styles.text}>Address:</Text>
                                    <Text style={styles.text}>{settings.settings.address} </Text>
                                </View>
                                <View>
                                    <Text style={styles.text}>Phone:</Text>
                                    <Text style={styles.text}>{settings.settings.first_phone} / {settings.settings.second_phone}</Text>
                                </View>
                                <View>
                                    <Text style={styles.text}>{settings.settings.email}</Text>
                                </View>
                            </View>
                            <View style={{width: "40%"}}>
                                <Image fixed cache={false} style={{padding: "10px", objectFit: "contain"}}
                                       source={{uri: `${process.env.NEXT_PUBLIC_URL}public/${settings.settings.signature}`}}/>
                            </View>
                        </View>
                    </View>
                </View>
            </PdfPage>
        </PdfDocument>
    )
}
