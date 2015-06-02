Template.taskAssignment.onRendered(function() {
    $('.ta-editor-filter').trigger('click');
});



Template.registerHelper('isChecked', function(status){
    return status === 'ready' ? 'checked': '';
});

Template.taskAssignment.helpers({
    'leftNaviDataType': function() {
        return taskAssign.getDataType();
    },
    'typeZhname': function() {
        return taskAssign.getCurDataType().name;
    },
    'selectedTask': function() {
        // TODO
        return taskAssign.getReadyTask();
    },
    'taskList': function() {
        return taskAssign.getTaskFromTaskPool();
    },
    'taskCount': function() {
        return taskAssign.getTaskFromTaskPool().fetch().length;
    },
    'selectAll': function() {
        return taskAssign.getGroupCheckStatus();
    },
    'curLocality': function() {
        return taskAssign.getLocality().zhName;
    },
    'foundedTaskCount': function() {
        return taskAssign.getFoundedTaskCount();
    },
    'editorTask': function() {
        return taskAssign.getEditorTask();
    }
});


Template.taskAssignment.events({
    'change #ta-dataSelection': function(e) {
        var type = $(e.target).val();
        taskAssign.setCurDataType(type);
    },
    'click .ta-confirm-task-count': function(e) {
        e.preventDefault();
        var text = $('#ta-task-count').val(),
            num = Number($.trim(text));
        console.log('本次请求任务个数:' + num);
        taskAssign.setTaskCount(num);
    },
    'click .fc-filter': function(e) {
        e.preventDefault();
        var lid = $(e.target).attr('id'),
            zhName = $(e.target).attr('data-fc-filter-alias');
        console.log('地域名字:' + zhName + ' | Id:' + lid);
        taskAssign.setLocality({'zhName': zhName, 'localityId': lid});
    },
    'click input[class="ta-task-checkbox"]': function(event) {
        event.preventDefault();
        event.stopPropagation();
        var pk = $(event.target).parent().attr('id');
        if(event.target.checked){
            taskAssign.taskReady(pk);
        }else{
            taskAssign.taskUnready(pk);
        }
    },
    'click .ta-task-assign': function(event) {
        event.preventDefault();
        var editorId = $('#ta-editors-selection :checked').attr('value'),
            editorName = $('#ta-editors-selection :checked').text();
        taskAssign.taskAssign(editorId, editorName);
    },
    'click #ta-select-all-or-none': function(event) {
        event.preventDefault();
        taskAssign.groupCheck();
    },
    'click .ta-editor-filter': function(event) {
        event.preventDefault();
        var eid = $(event.target).attr('id');
        taskAssign.setEditorFilter(eid);
        // 屏蔽span badge的功能
        $(event.target).addClass("cur-editor-filter").siblings().removeClass("cur-editor-filter");
    },
    'click input[class="ta-assigned-task-checkbox"]': function(event) {
        event.preventDefault();
        event.stopPropagation();
        var pk = $(event.target).parent().attr('id');
        if(event.target.checked) {
            taskAssign.pullTaskBackToPool(pk);
        }
    },
    'click .ta-task-assign-confirm': function(event) {
        event.preventDefault();
        taskAssign.taskConfirm(taskAssignDialog);
    },
});

function taskAssignDialog(data) {
    check(data, Array);
    var taskAssignDetail = data;
    bootbox.dialog({
        title: "任务发布",
        message: Blaze.toHTMLWithData(Blaze.Template.taskAssignConfirmDialog, {
            'taskAssignDetail': taskAssignDetail
        }),
        buttons: {
            cancel: {
                label: "取消",
                className: "btn-danger",
                callback: function() {
                  bootbox.hideAll();
                }
              },
            success: {
                label: "确定",
                className: "btn-success",
                callback: function () {
                    // alert('提交');
                    taskAssign.taskPublish();
                }
            },
        }
    });
}