import React from 'react';

function Blank(props) {
    return (
        <div>
            {/* start: Header */}
            <div className="px-3 py-2 bg-white rounded shadow">
                <i className="ri-menu-line sidebar-toggle me-3 d-block d-md-none"/>
                <h5 className="fw-bold mb-0 me-auto">Blank</h5>
                Container area
            </div>
            {/* end: Header */}
            <div className="px-3 mt-2 py-2 bg-white rounded shadow">
               
            </div>
        </div>
    );
}

Blank.auth = true;
export default Blank;
