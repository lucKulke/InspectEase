




class DataMapper:

    @classmethod
    def mapp_data_to_form_representation_data(
        cls,
        annotation_data: dict,
        form_representation_data: dict,
        form_trainings_data: dict,
    ):

        for annotaition_id, data in annotation_data.items():
            for task_name, fields in form_representation_data.items():
                for id in fields:
                    if id == annotaition_id:
                        form_representation_data[task_name][id]["location"] = data[
                            "location"
                        ]
                        form_representation_data[task_name][id]["page"] = data["page"]

        for id, examples in form_trainings_data["individual_fields"].items():
            for task_name, fields in form_representation_data.items():
                for field_id in fields:
                    if field_id == id:
                        form_representation_data[task_name][id][
                            "trainings_data"
                        ] = examples


class Field:
    def __init__(
        self,
        id: str,
        description: str,
        form_input_type: str,
        location: list,
        trainings_data=dict,
        value=str,
        page=int,
    ) -> None:
        self.id = id
        self.description = description
        self.form_input_type = form_input_type
        self.location = location
        self.value = value
        self.trainings_data = trainings_data
        self.page = page

    def __repr__(self):
        return str(
            {
                "id": self.id,
                "description": self.description,
                "form_input_type": self.form_input_type,
                "location": self.location,
                "value": self.value,
                "trainings_data": self.trainings_data,
                "page": self.page,
            }
        )


class Fields:

    def __init__(self, fields: dict) -> None:
        self._fields = {}
        self.init_fields(fields=fields)

    def init_fields(self, fields: dict):
        self._fields = {}
        for id, propertys in fields.items():
            trainings_data = None
            value = None
            if "trainings_data" in propertys:
                trainings_data = propertys["trainings_data"]
            if "value" in propertys:
                value = propertys["value"]

            self._fields[id] = Field(
                id=id,
                description=propertys["option_name"],
                form_input_type=propertys["form_input"],
                location=propertys["location"],
                value=value,
                trainings_data=trainings_data,
                page=propertys["page"],
            )

    def update(self, json_data: dict) -> None:
        for outer_id, value in json_data.items():
            new_value = value[self._fields[outer_id].description]
            if new_value == "None":
                new_value = None

            self._fields[outer_id].value = new_value

    def get_description_and_value(self):
        data = {}
        for id in self._fields:
            field = self._fields[id]
            data[field.description] = field.value

        return data

    def data_for_annotations(self):
        data = {}
        for id in self._fields:
            field = self._fields[id]
            data[id] = {
                "location": field.location,
                "value": field.value,
                "page": field.page,
            }
        return data

    def get_minimal_fields_information(self):
        data = {}

        for id in self._fields:
            data[id] = {self._fields[id].description: str(self._fields[id].value)}
        return data

    def get_field_id_and_description(self):
        data = {}
        for id in self._fields:
            data[id] = self._fields[id].description
        return data

    def is_at_least_one_field_filled(self):
        for id in self._fields:
            if self._fields[id].value:
                return True
        return False

    def get_field_descriptions(self):
        data = []
        for id in self._fields:
            data.append(self._fields[id].description)
        return data

    def __getitem__(self, key):
        return self._fields[key]

    def fields(self):
        return self._fields

    def __repr__(self):
        return f"{self._fields}"


class FormData:
    def __init__(self, data: dict) -> None:
        self._data = self.convert_to_sections(dict_data=data)

    def get_data(self):
        return self._data

    def __getitem__(self, key):
        return self._data[key]

    def __setitem__(self, key, value):
        self._data[key] = value

    def __delitem__(self, key):
        del self._data[key]

    def __repr__(self):
        return f"{self._data}"

    def list_of_task_names(self):
        return list(self._data)

    def convert_to_sections(self, dict_data: dict) -> list:
        data = {}
        for task_name, fields in dict_data.items():
            data[task_name] = Fields(fields=fields)

        return data