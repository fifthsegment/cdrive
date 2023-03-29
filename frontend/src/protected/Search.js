import {
    Autocomplete,
    Box,
    CircularProgress,
    TextField,
    Typography,
  } from "@mui/material";
  import { Search as SearchIcon } from "@mui/icons-material";
  import { makeStyles } from "@mui/styles";
  
  import React, { useState } from "react";
  import { useSearchObjects } from "./hooks";
  import { SearchFieldWrapper } from "./elements";
  import ObjectIconDisplayer from "./IconDisplayer";
  import { isFolder } from "../utils";
  
  const useStyles = makeStyles({
    inputRoot: {
      backgroundColor: "white",
      height: "40px",
      padding: "2px !important",
    },
  });
  const CustomOption = (props) => {
    const { name, value, onClick, onChanged } = props;
    const folder = isFolder(value);
    return (
      <Box
        display="flex"
        flexDirection="column"
        style={{
          marginLeft: 10,
          marginBottom: 10,
          textOverflow: "ellipsis",
          width: "100%",
          overflow: "hidden",
          height: folder ? 60 : 40,
          cursor: "pointer",
        }}
        onClick={() => {
          onClick(value);
          onChanged(value.name);
        }}
      >
        <Typography
          variant="subtitle1"
          style={{ textOverflow: "ellipsis", width: "100%", overflow: "hidden" }}
        >
          <ObjectIconDisplayer object={value} />
          &nbsp; {name}
        </Typography>
        {folder && (
          <Typography style={{ paddingLeft: 32 }}>{value.path}</Typography>
        )}
      </Box>
    );
  };
  
  function Search({ onSelectSearchedItem }) {
    const [searchTerm, setSearchTerm] = useState("");
    const { data, isLoading } = useSearchObjects(searchTerm);
    const classes = useStyles();
    const [fakeValue, setFakeValue] = useState("");
  
    const onChanged = (name) => {
      setFakeValue(name);
      setSearchTerm("")
    };
    return (
      <SearchFieldWrapper>
        <Autocomplete
          value={fakeValue}
          fullWidth
          freeSolo
          loading={isLoading}
          options={data || []}
          renderOption={(props, option) => (
            <div key={option._id}>
              <CustomOption
                onChanged={onChanged}
                {...props}
                name={option.name}
                value={option}
                onClick={onSelectSearchedItem}
              />
            </div>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search files or folders..."
              InputProps={{
                ...params.InputProps,
                classes: {
                  ...params.InputProps.classes,
                  root: classes.inputRoot,
                },
                startAdornment: <SearchIcon style={{ paddingLeft: 10 }} />,
                endAdornment: (
                  <>
                    {isLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
            />
          )}
        />
      </SearchFieldWrapper>
    );
  }
  
  export default Search;
  