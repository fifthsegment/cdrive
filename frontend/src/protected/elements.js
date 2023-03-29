import { Button, CircularProgress } from "@mui/material";
import styled from "styled-components";

export const ObjectIconWrapper = styled.span`
  &&& {
    svg {
      position: relative;
      top: 5px;
    }
  }
`;

export const SearchFieldWrapper = styled.div`
  width: 70vw;
  margin-right: 10px;
`;

export const TotalProgress = styled(CircularProgress)`
  position: relative;
  top: 5px;
  margin-right: 10px;
`;
export const GridRow = styled.div`
  display: flex;
  border-bottom: 1px solid #ccc;

`;
export const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const GridItem = styled.div`
  width: 100px;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const GridItemGrow = styled.div`
  flex-grow: 1;
  padding: 8px;
  display: flex;
`;
