data "external_schema" "bun" {
    program = [
        "go",
        "run",
        "./internal/db/atlas.go",
    ]
}

env "local" {
    src = data.external_schema.bun.url
    dev = "docker://postgres/15/dev"

    migration {
        dir = "file://migrations"
        format = atlas
    }

    format {
        migrate {
            diff = "{{ sql . \" \" }}"
        }
    }
}

env "ci" {
    src = data.external_schema.bun.url
    dev = "docker://postgres/15/dev"
  
    migration {
        dir    = "file://migrations"
        format = atlas
    }
}