import style from "./style.css";
import './data/us_region_state_county_hierarchy.json';
import {json} from 'd3-fetch';
import {select, selectAll} from 'd3-selection';

/*
Load the data using d3.json(), which uses the Fetch API to load
data from file and transform the JSON to a flat array
*/
json('./data/us_region_state_county_hierarchy.json', d => {
    d.id = +d.id;
    d.parent = +d.parent;
    return d;
}).then(data => render(data));

/* 
Rendering function that is called once JSON data have been
returned from Promise (d3.json() response)
*/
const render = (data) => {


    /* 
    Default search box message
    */
    const defaultMessage = "Please select a county";

    /*
    Extract regions, states, and counties from JSON
    */
    const regions = data.filter(d => d.level === "region");
    const states = data.filter(d => d.level === "state");
    const counties = data.filter(d => d.level === "county");

    /*
    Generate HTML elements to be used to populate the
    dropdown box; elements are created hierarchically,
    preserving the hierarchy in the original data
    (relationships between regions, states, and counties)
    */

    // Container element to be populated with search options
    const optionsList = select("#options");

    regions.forEach(region => {

        let regionGroup = optionsList.append("ul")
            .attr("class", "group--region");

        regionGroup.append("label")
            .attr("class", "option---region")
            .html(region.name);

        states.filter(d => d.parent == region.id)
            .forEach(state => {

                let stateGroup = regionGroup.append("ul")
                    .attr("class", "group--state");

                stateGroup.append("label")
                    .attr("class", "option--state")
                    .html(state.name);

                let stateCounties = counties.filter(d => d.parent == state.id);

                if(stateCounties.length == 0) {

                    return;

                } else {

                    stateCounties.forEach(county => {
                        stateGroup.append("li")
                        .attr("class"," option--county")
                        .attr("value", county.name)
                        .html(county.name);

                    });
                }
            });
    });


    /*
    When the search box is clicked, update the display
    of the options list
    */
    const searchField = select("#select-box--field");
    searchField.on("click", function() {
    
        if(selected.county) {

            updateScrollPosition();
            update(true);

        } else {
            select(this).property("value", "");
            update(true);
        }

    });

    /*
    When the user types into the search field,
    capture input and display filtered list of
    counties that match supplied search term
    */
    let inputActive = false;
    let countyNames = counties.map(d => d.name);    
    
    searchField.on("input", function() {

        // Capture input
        let searchTerm = this.value.toLowerCase();

        // Find county names that match input
        let matches = countyNames.filter(d => d.includes(searchTerm));

        // Selectively display items in options list that match input
        selectAll(".option--county").each(function() {
            let el = select(this);

            if(matches.indexOf(el.attr("value")) >= 0) {

                el.classed("option--hidden", false);

            } else {
    
                el.classed("option--hidden", true);

            }
        });
    
        // Hide regions for which there are no matching counties
        selectAll(".group--region").each(function() {
    
            let g = select(this);
            // Get number of visible items in the region
            let visibleCount = g.selectAll("li:not(.option--hidden)").size();

            // If no visible items, hide region
            if(visibleCount == 0) {
                g.classed("option--hidden", true);

                
            } else {

                // If there are visible items, iterate through states;
                // hide states for which there are no matching counties
                g.classed("option--hidden", false);

                g.selectAll(".group--state").each(function() {
    
                    let s = select(this);

                    // Get number of visible items in the state
                    let visibleCount = s.selectAll("li:not(.option--hidden)").size();
                    if(visibleCount == 0) {
                        s.classed("option--hidden", true);
                        
                    } else {
                        s.classed("option--hidden", false);

                    }
                });
            }
        });

        /*
        Make the options list visible, if not already 
        */
        inputActive = true;
        update(true);
    
    });
    

    
    /*
    updateScrollPosition function:
    Updates the scroll position of the options dropdown,
    based on whether or not an item has been selected
    */
    const updateScrollPosition = () => {
        if(selected.county) {

            let position = selected.element.offsetTop;
            optionsList.node().scrollTop = position;

        } else {
            optionsList.node().scrollTop = 0;
        }
    }

    /*
    Update function: renders the options dropdown
    visible or hidden, based on other interactions
    */
    const update = function(isVisible) {
    
        if(isVisible) {
            optionsList.style("visibility", "visible");

            selectBoxArrow
                .select("span")
                .classed("arrow-down", false)
                .classed("arrow-up", true);
    
        } else {

            optionsList.style("visibility", "hidden");

            selectBoxArrow
                .select("span")
                .classed("arrow-down", true)
                .classed("arrow-up", false);

        }

        if(selected.county) {
            updateScrollPosition();
        }

        if(!inputActive) {
            // If no longer active input, make all
            // list items visible again
            selectAll("label, li").each(function() {
                select(this).classed("option--hidden", false);
            });
        }

    };
    
    /*
    Dropdown select box arrow and clear buttons,
    for opening, closing, and resetting the view of the dropdown
    */
    const selectBoxArrow = select("#select-box--arrow");
    const selectClear = select("#select-box--clear");
    
    selectBoxArrow.on("click", function() {
        let visibility = optionsList.style("visibility");
        if(visibility === "visible") {
            update(false);
        } else if(visibility === "hidden") {
            update(true);
        }
    });

    selectClear.on("click", function() {
        selected.county = null;
        selected.element = null;
        inputActive = false;

        searchField.property("value", defaultMessage);
        update(true);
        updateScrollPosition();
        select(this).style("visibility", "hidden");

        

    });
    

    /*
    Selecting individual counties in the dropdown list
    updates the view of the interface
    */
    let selected = {county: null, element: null};
    
    selectAll(".option--county").each(function() {
        
        select(this).on("click", function() {
                
            inputActive = false;

            let el = select(this);
            selected.county = el.attr("value");
            selected.element = el.node();

            searchField.property("value", selected.county);
            selectClear.style("visibility", "visible");
            update(false);
    
        });
    });


    /*
    When the user clicks outside of the dropdown select,
    reset the view of the interface
    */
    window.addEventListener("click", event => {

        if(event.target == document.querySelector("#container")) {
            optionsList.style("visibility", "hidden");
            selectBoxArrow
                .select("span")
                .classed("arrow-up", false)
                .classed("arrow-down", true);

            if(!selected.county) {
                searchField.property("value", defaultMessage);
            } else {
                searchField.property("value", selected.county);
            }

            inputActive = false;
            update(false);
        }

    })
}

