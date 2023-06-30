import {Spinner} from "react-bootstrap";
import React from 'react';

export default function Loading() {
    return (
        <>
            <div style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div className="text-center">
                    <Spinner animation="border" className="mb-3" variant="primary"/>
                    <h5>Yükleniyor...</h5>
                </div>
            </div>
        </>
    );
}
