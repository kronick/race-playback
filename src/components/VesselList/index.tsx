import React from "react";
import { Box, CheckBox, Table, TableRow, TableCell } from "grommet";

import { VesselData } from "../../shared-types/race-data";

type VesselListProps = {
  vessels: VesselData[];
};
const VesselList: React.FC<VesselListProps> = ({ vessels }) => {
  return (
    <div style={{ position: "absolute", top: "5em", left: "1em" }}>
      <Box direction="column" round={"xsmall"} background="white">
        <Table>
          {vessels.map(v => {
            const speed: null | number = false ? 0 : null;
            return (
              <TableRow style={{ cursor: "pointer" }} onClick={() => null}>
                <TableCell>
                  <CheckBox toggle />
                </TableCell>
                <TableCell>
                  <strong>{v.name}</strong>
                </TableCell>
                <TableCell>{`${
                  speed !== null ? speed.toFixed(1) : "---"
                }kts`}</TableCell>
              </TableRow>
            );
          })}
        </Table>
      </Box>
    </div>
  );
};

export default VesselList;
