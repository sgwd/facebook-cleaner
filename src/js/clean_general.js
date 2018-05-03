module.exports = {
    openSections: function(callback) { // 3 sections (Interests, Advertisers, Your Information) should be open
        var closeSections = $("._2qo9");
        for (var i = 0; i < 3; i++) {
            var className = closeSections[i].classList.value;
            if (className.indexOf("hidden_elem") > -1) {
                // open closed/hidden sections
                closeSections[i].click();
            }
        }
        callback();
    },
    getSectionDom: function(index) { // Get the most up to date state of the section
        var sections = $("._2qo2");
        return $(sections[index]);
    },
    clickMoreDropdown: function(sectionI, section, callback) {
        var more = section.find("._1b0");
        more.on('click', function() {
            more.off();
            // wait for the menu to load
            setTimeout(function() {
                console.log("Clicked More");
                callback(sectionI);
            }, 1500);
        });
        more.click();
    },
    actuallyClick: function(section, index, buttons, clickedArr, callback) { // Iterate through clicking the boxes in view
        var self = this;
        if (buttons.length > 0) {
            switch (section) {
                case 0:
                    var parent = $(buttons[index]).parents("._3viq").find("._qm-");
                    break;
                case 1:
                    var parent = $(buttons[index]).parents("._3viq").find("._3vin");
                    break;
                case 2:
                    var parent = $(buttons[index]).parents("._zoj._5f0v").find("._zok._4ik4._4ik5");
                    break;
            }
            parent.css("color", "red");
            clickedArr.push(parent.text());
            buttons[index].click();
            index++;
            if (index < buttons.length) {
                setTimeout(function() {
                    self.actuallyClick(section, index, buttons, clickedArr, callback);
                    // create a delay so the click can be registered
                }, 200);
            } else {
                callback(clickedArr);
            }
        } else {
            callback(clickedArr);
        }
    },
    updateCheckedCategoriesText: function(items) {
        var checkedCategories = [];
        if (items['clean-1']) { checkedCategories.push('"Your Interests"') };
        if (items['clean-2']) { checkedCategories.push('"Advertisers you\'ve interacted with"') };
        if (items['clean-3']) { checkedCategories.push('"Your Information"') };
        if (checkedCategories.length > 0) {
            $("#checked-categories").text("You've checked the following sections: " + _.join(checkedCategories, ", ") + ".");
            $("#start-clean").removeClass("low");
        } else {
            $("#checked-categories").text("You haven't checked any sections below yet.");
            $("#start-clean").addClass("low");
        }
    },
    restoreOptions: function() { // Restores checkbox state using the preferences stored in chrome.storage.local
        var self = this;
        chrome.storage.local.get(['clean-1', 'clean-2', 'clean-3'], function(items) {
            document.getElementById('clean-1').checked = items['clean-1'];
            document.getElementById('clean-2').checked = items['clean-2'];
            document.getElementById('clean-3').checked = items['clean-3'];
            self.updateCheckedCategoriesText(items);
        });
    },
    addingUIElems: function() {
        $("#ads_preferences_desktop_root")
            .append($("<div>", { id: "ads-overlay" }).fadeIn()
                .append($("<p>", { class: "content" }).text(" Scroll down and check the boxes at the top of the sections below to remove it's content.")
                    .prepend($("<b>").text("Target ____")))
                .append($("<p>", { id: "checked-categories", class: "content" }).hide())
                .append($("<div>", { class: "content" })
                    .append($("<button>", { id: "start-clean", class: "button" }).text("Clean checked preferences now").hide())
                )
            );

        for (var i = 0; i < 3; i++) {
            $(this.getSectionDom(i))
                .prepend($("<div>", { class: "section-checkbox" }).hide()
                    .append($("<form>", { class: "clean-checkboxes" })
                        .append($("<label>", { class: "container" }).text("Remove the content from each tab in the below section")
                            .append($("<input>", { id: "clean-" + (i + 1), type: "checkbox" }))
                            .append($("<span>", { class: "checkmark" }))
                        )
                    )
                );
            if (i === 0) {
                $(".section-checkbox").first().append($("<button>", { id: "readd-interests", class: "button" }).text('Re-add all "Removed Interests"'))
            }
        }
    },
    listenerFunction: function() { // Listens to changes to the checkboxes and updates chrome.storage.local
        var self = this;
        var arr = ['clean-1', 'clean-2', 'clean-3'];

        for (var i = 0; i < arr.length; i++) {
            $("#" + arr[i]).change(function(e) {
                var obj = {};
                var key = e.target.id;
                obj[key] = e.target.checked;
                chrome.storage.local.set(obj);
                chrome.storage.local.get(arr, function(data) {
                    console.info(data);
                    self.updateCheckedCategoriesText(data)
                });
            })
        }
    }
}